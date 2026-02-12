const fs = require('fs');
const path = 'client/src/index.css';

try {
    let content = fs.readFileSync(path, 'utf8');
    // Find the end of the scrollbar section (last closing brace before the garbage)
    // The garbage starts with "/ *" or similar. 
    // We know the last valid css rule ends with "background: var(--color-primary);\n}"

    // Look for the last valid brace
    const marker = 'background: var(--color-primary);\n}';
    const lastValidIdx = content.lastIndexOf(marker);

    if (lastValidIdx !== -1) {
        // Keep up to the closing brace
        const cleanContent = content.substring(0, lastValidIdx + marker.length);
        fs.writeFileSync(path, cleanContent);
        console.log('Successfully truncated index.css to remove garbage.');
    } else {
        // Fallback: try to find just the last brace
        const lastBrace = content.lastIndexOf('}');
        if (lastBrace !== -1) {
            const cleanContent = content.substring(0, lastBrace + 1);
            fs.writeFileSync(path, cleanContent);
            console.log('Truncated to last brace.');
        } else {
            console.log('Could not find split point.');
        }
    }
} catch (e) {
    console.error('Error:', e);
}
