const dev = process.env.NODE_ENV === 'development';

module.exports = {
    future: {
        removeDeprecatedGapUtilities: true,
        purgeLayersByDefault: true,
    },
    purge: {
        enabled: !dev,
        mode: 'layers',
        content: [
            './src/pages/**/*.njk',
            './src/components/**/*.tsx',
        ]
    },
	theme: {
        extend: {
            fontSize: {
                "tiny": "0.5rem"
            }
        }
    }
}