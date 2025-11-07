// Utilidad simple para limpiar y tokenizar texto
function tokenize(text) {
    return (text || "")
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(Boolean);
}

// Calcula TF (frecuencia de término) para un array de tokens
function termFrequency(tokens) {
    const tf = {};
    tokens.forEach((token) => {
        tf[token] = (tf[token] || 0) + 1;
    });
    const total = tokens.length;
    Object.keys(tf).forEach((token) => {
        tf[token] = tf[token] / total;
    });
    return tf;
}

// Calcula IDF (inversa de frecuencia de documento) para todos los documentos
function inverseDocumentFrequency(docs) {
    const idf = {};
    const totalDocs = docs.length;
    const vocab = new Set();
    docs.forEach((tokens) => tokens.forEach((t) => vocab.add(t)));
    vocab.forEach((term) => {
        let count = 0;
        docs.forEach((tokens) => {
            if (tokens.includes(term)) count++;
        });
        idf[term] = Math.log((totalDocs + 1) / (count + 1)) + 1;
    });
    return idf;
}

// Calcula el vector TF-IDF para un documento
function tfidfVector(tf, idf, vocab) {
    return vocab.map((term) => (tf[term] || 0) * (idf[term] || 0));
}

// Calcula la similitud de coseno entre dos vectores
function cosineSimilarity(vecA, vecB) {
    let dot = 0,
        magA = 0,
        magB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
    }
    return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}

export {
    tokenize,
    termFrequency,
    inverseDocumentFrequency,
    tfidfVector,
    cosineSimilarity,
};
