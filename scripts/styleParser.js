class StyleParser {
    parse(text) {
        const styles = {};
        const regex = /\[style=([^\]]+)\]/g;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            const styleParts = match[1].split(',');
            styleParts.forEach(part => {
                const [key, value] = part.split(':');
                if (key && value) {
                    styles[key.trim()] = value.trim();
                }
            });
        }
        
        return styles;
    }
}

module.exports = { StyleParser };
