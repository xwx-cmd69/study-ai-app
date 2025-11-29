const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");

const app = express();
app.use(fileUpload());

const path = require("path");
app.use(express.static(__dirname)); // now serves files in root

// Quick text summary generator
function summarizeText(text) {
    let sentences = text.split(".").filter(s => s.trim().length > 0);
    let summary = sentences.slice(0, 5).join(". ") + ".";
    return summary;
}

// Generate 5 quiz questions from text
function generateQuiz(text) {
    let words = text.split(/\s+/).filter(w => w.length > 6);
    let uniqueWords = [...new Set(words)];

    let quiz = [];

    for (let i = 0; i < 5; i++) {
        let word = uniqueWords[i] || "photosynthesis";
        quiz.push({
            question: `What does "${word}" mean in the context of the text?`,
            correctAnswer: "Any valid explanation based on the PDF"
        });
    }
    return quiz;
}

app.post("/process-pdf", async (req, res) => {
    if (!req.files || !req.files.pdf) {
        return res.status(400).json({ error: "No PDF uploaded." });
    }

    try {
        let buffer = req.files.pdf.data;
        let data = await pdfParse(buffer);

        let summary = summarizeText(data.text);
        let quiz = generateQuiz(data.text);

        res.json({
            summary,
            quiz,
            rawText: data.text
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//app.get("/", (req, res) => {
    //res.send("PDF Summarizer Backend Running.");//

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on " + port));
