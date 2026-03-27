const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');
const Job = require('../models/Job');

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function ensureOpenAIConfigured(res) {
  const openai = getOpenAIClient();

  if (!openai) {
    res.status(500).json({
      error: 'OPENAI_API_KEY is missing in backend/.env',
    });
    return null;
  }

  return openai;
}

const extractResume = async (req, res) => {
  try {
    const openai = ensureOpenAIConfigured(res);
    if (!openai) return;

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;

    // Use OpenAI to extract skills
    const prompt = `Extract a concise list of technical and soft skills from the following resume text. Output ONLY a JSON array of strings, nothing else.\n\nResume Text:\n${text.substring(0, 4000)}`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    try {
      let content = response.choices[0].message.content.trim();
      if(content.startsWith("\`\`\`json")) {
        content = content.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
      }
      const skills = JSON.parse(content);
      res.json({ filename: req.file.originalname, skills });
    } catch (parseError) {
      res.json({ filename: req.file.originalname, skills: ["Communication", "Problem Solving"] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const matchJobs = async (req, res) => {
  try {
    const openai = ensureOpenAIConfigured(res);
    if (!openai) return;

    const { skills } = req.body;
    if (!skills || !Array.isArray(skills)) return res.status(400).json({ error: 'Skills array is required' });

    const queryText = skills.join(', ');
    
    const embedResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: queryText,
    });
    const queryEmbedding = embedResponse.data[0].embedding;

    const jobs = await Job.find({ status: 'active' });
    
    const cosineSimilarity = (vecA, vecB) => {
      let dotProduct = 0;
      for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
      }
      return dotProduct; 
    };

    const scoredJobs = jobs.map(job => {
      let similarity = 0;
      if (job.similarityEmbedding && job.similarityEmbedding.length === queryEmbedding.length) {
        similarity = cosineSimilarity(queryEmbedding, job.similarityEmbedding);
      }
      return { ...job._doc, similarity };
    });

    scoredJobs.sort((a, b) => b.similarity - a.similarity);
    const topJobs = scoredJobs.slice(0, 5);

    res.json({ matches: topJobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const tailorResume = async (req, res) => {
  try {
    const openai = ensureOpenAIConfigured(res);
    if (!openai) return;

    const { resumeText, jobDescription } = req.body;
    
    const prompt = `You are an expert resume writer. Tailor the following resume to better match the given job description. Keep the truthfulness intact but highlight the most relevant skills.\n\nJob Description:\n${jobDescription}\n\nOriginal Resume:\n${resumeText}`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: prompt }],
    });

    res.json({ tailoredResume: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { extractResume, matchJobs, tailorResume };
