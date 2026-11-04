const fs = require('fs');
const path = require('path');
const apiKey = process.env.GEMINI_API_KEY;

const dir = path.join("G:", "My Drive", "A2 - Game v4", "Jalur-Senyap-v4", "assets", "audio", "vo");
fs.mkdirSync(dir, { recursive: true });

const lines = [
  {
    key: "maren_intro_start",
    speaker: "Maren",
    voice: "Aoede",
    style: "alert and observant caravan leader, natural conversational Indonesian with a slight curious pause",
    text: "Berhenti di situ... <short pause> Tas itu... Kamu tahu siapa pemilik sebelumnya?"
  },
  {
    key: "maren_intro_nara_1",
    speaker: "Nara",
    voice: "Leda",
    style: "humble young apprentice courier, polite and earnest, natural conversational Indonesian",
    text: "Kata orang desa, kurir yang paling banyak mengantar surat sepanjang jalur. Namanya Sahdan."
  },
  {
    key: "maren_intro_maren_2",
    speaker: "Maren",
    voice: "Aoede",
    style: "warm maternal tone, fond reminiscent smile, welcoming greeting, natural conversational Indonesian",
    text: "Memang Sahdan. Dan dia tidak pernah mengeluh soal bahu pegal. <short pause> Selamat datang di Pos Batu Biru, Nara. Teduh di jalanmu."
  },
  {
    key: "maren_intro_nara_2",
    speaker: "Nara",
    voice: "Leda",
    style: "polite, respectful traditional greeting response, gentle and earnest",
    text: "Air di langkahmu, Bu Maren."
  },
  {
    key: "maren_intro_maren_3",
    speaker: "Maren",
    voice: "Aoede",
    style: "pleased and brisk, warm, giving practical instructions with a touch of good humor",
    text: "Kamu paham sopan santun Asharim. Bagus. Tugas pertamamu ringan: roti rempah untuk Juma di Menara Batu Senja di bukit utara. Dia bilang rotiku harus sampai selagi hangat!"
  },
  {
    key: "maren_intro_maren_tut",
    speaker: "Maren",
    voice: "Aoede",
    style: "encouraging and practical mentor, warm advice, conversational Indonesian",
    text: "Gunakan lari dan lompatanmu. Di tubir bukit yang curam, buka Jubah Layar untuk melayang santai. Ikuti Ruru kalau bingung... dia tidak pernah tersesat."
  }
];

async function generateLine(line) {
  const url = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${apiKey}`;
  const body = {
    model: "gemini-3.8-flash-tts",
    input: [{
      type: "user_input",
      content: [{
        type: "text",
        text: line.text,
        annotations: [{
          type: "speech_metadata",
          speaker: line.speaker,
          style: line.style
        }]
      }]
    }],
    response_format: { type: "audio" },
    generation_config: {
      speech_config: [
        { voice: line.voice }
      ]
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const json = await res.json();
  if (json.steps && json.steps[0] && json.steps[0].content) {
    const audio = json.steps[0].content.find(c => c.type === 'audio');
    if (audio && audio.data) {
      const filePath = path.join(dir, `${line.key}.wav`);
      fs.writeFileSync(filePath, Buffer.from(audio.data, 'base64'));
      console.log(`✓ Generated ${line.key}.wav (${fs.statSync(filePath).size} bytes)`);
      return;
    }
  }
  console.error(`✗ Failed ${line.key}:`, JSON.stringify(json).substring(0, 200));
}

async function main() {
  for (const line of lines) {
    await generateLine(line);
    // polite throttle between API calls
    await new Promise(r => setTimeout(r, 600));
  }
  console.log("All intro lines generated successfully!");
}

main().catch(console.error);
