import { submitFeedback } from '@/app/actions/feedback';
import { createClient } from '@/lib/db/server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

// Mock the dependencies
jest.mock('@/lib/db/server');
jest.mock('next/cache');
jest.mock('next/headers');

describe('submitFeedback Server Action', () => {
    let mockSupabase: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mock Supabase client
        mockSupabase = {
            auth: {
                getUser: jest.fn(),
            },
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
        };

        (createClient as jest.Mock).mockReturnValue(mockSupabase);
        (headers as jest.Mock).mockResolvedValue({
            get: jest.fn().mockReturnValue('127.0.0.1'),
        });
    });

    it('should return error if user is not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

        const formData = new FormData();
        const result = await submitFeedback(formData);

        expect(result).toEqual({ error: 'Oturum açmanız gerekiyor.' });
    });

    it('should return error if user profile is not found', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
        mockSupabase.single.mockResolvedValue({ data: null, error: new Error('Not found') });

        const formData = new FormData();
        const result = await submitFeedback(formData);

        expect(result).toEqual({ error: 'Feedback göndermek için üye olmanız gerekmektedir.' });
    });

    it('should return error if mandatory fields are missing', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
        mockSupabase.single.mockResolvedValue({ data: { id: 'user-123', role: 'creator' }, error: null });

        const formData = new FormData();
        // Missing category and description
        const result = await submitFeedback(formData);

        expect(result).toEqual({ error: 'Lütfen tüm zorunlu alanları doldurun.' });
    });

    it('should successfully submit feedback', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
        mockSupabase.single.mockResolvedValue({ data: { id: 'user-123', role: 'creator' }, error: null });
        mockSupabase.insert.mockResolvedValue({ error: null });

        const formData = new FormData();
        formData.append('category', 'bug');
        formData.append('title', 'Test Bug');
        formData.append('description', 'This is a test');
        formData.append('severity', 'medium');

        const result = await submitFeedback(formData);

        expect(result).toEqual({ success: true });
        expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
            user_id: 'user-123',
            category: 'bug',
            title: 'Test Bug',
            description: 'This is a test',
            severity: 'medium',
            status: 'new'
        }));
        expect(revalidatePath).toHaveBeenCalledWith('/admin/feedback');
    });

    it('should handle database errors gracefully', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
        mockSupabase.single.mockResolvedValue({ data: { id: 'user-123', role: 'creator' }, error: null });
        mockSupabase.insert.mockResolvedValue({ error: { message: 'DB Error', code: '123' } });

        const formData = new FormData();
        formData.append('category', 'feature');
        formData.append('description', 'Test Feature');

        const result = await submitFeedback(formData);

        expect(result).toEqual({ error: 'Geri bildirim kaydedilemedi. Lütfen daha sonra tekrar deneyin.' });
    });

    it('should handle unexpected errors (e.g., JSON parse error) gracefully', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
        mockSupabase.single.mockResolvedValue({ data: { id: 'user-123', role: 'creator' }, error: null });

        const formData = new FormData();
        formData.append('category', 'bug');
        formData.append('description', 'Test Bug');
        formData.append('metadata', '{ invalid json }'); // This will throw in JSON.parse

        const result = await submitFeedback(formData);

        expect(result).toEqual({ error: 'Beklenmedik bir hata oluştu.' });
    });
});
