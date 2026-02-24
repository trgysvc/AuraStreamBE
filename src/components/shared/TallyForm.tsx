'use client';

import React from 'react';
import Script from 'next/script';

export default function TallyForm({ formId }: { formId: string }) {
    return (
        <div className="w-full mt-4">
            <iframe
                data-tally-src={`https://tally.so/embed/${formId}?transparentBackground=1`}
                data-tally-auto-height="1"
                width="100%"
                height="1200"
                frameBorder="0"
                scrolling="no"
                className="bg-transparent overflow-hidden"
                title="Enterprise Inquiry Form"
            ></iframe>
            <Script
                id="tally-js"
                src="https://tally.so/widgets/embed.js"
                onLoad={() => {
                    // @ts-ignore
                    if (typeof Tally !== 'undefined') {
                        // @ts-ignore
                        Tally.loadEmbeds();
                    }
                }}
            />
        </div>
    );
}
