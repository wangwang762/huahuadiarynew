const fs = require("fs");

const source = fs.readFileSync("screens-diary.jsx", "utf8");
for (const marker of ["function TimelineDate", 'data-timeline-date="true"', "fontSize: 22", "entry.day"]) {
  if (!source.includes(marker)) throw new Error(`date-led timeline missing marker: ${marker}`);
}
const timelineHead = source.slice(0, source.indexOf("window.DiaryTimeline"));
if (timelineHead.includes("<TimelineMark")) throw new Error("old icon timeline node remains");
if (timelineHead.includes("<PlantAvatar plant={p} size={26}")) throw new Error("chat avatar remains in diary card");

console.log("DIARY_TIMELINE_DATE_OK");
