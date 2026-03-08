import { getVenueTracks_Action } from "./src/app/actions/venue";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
    try {
        console.log("Fetching tracks with [60, 180] BPM...");
        const tracks = await getVenueTracks_Action({ bpmRange: [60, 180] });
        console.log(`Found ${tracks.length} tracks!`);
        if (tracks.length > 0) {
           console.log("Sample:", tracks[0].title);
        }
    } catch (e) {
        console.error("Failed:", e);
    }
}
run();
