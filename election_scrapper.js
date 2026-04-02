const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI);

// Define schema
const candidateSchema = new mongoose.Schema({
  name: String,
  party: String,
  status: String,
  state: String,
  constituency: String,
  profileLink: String,
  image: String
});

// enforce uniqueness on name+party+constituency
candidateSchema.index({ name: 1, party: 1, constituency: 1 }, { unique: true });

const Candidate = mongoose.model('Candidate', candidateSchema);

(async () => {
  let pageNum = 1;

  while (true) {
    const url = `https://affidavit.eci.gov.in/CandidateCustomFilter?electionType=32-AC-GENERAL-3-60&election=32-AC-GENERAL-3-60&states=S11&page=${pageNum}`;
    console.log(`Fetching page ${pageNum}...`);

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Stop if no data
    if ($('#data-tab tbody tr td').text().includes('No Data Available')) {
      console.log("✅ Finished scraping, no more data.");
      break;
    }

    // Extract candidates
    let batch = [];
    $('#data-tab tbody tr').each((i, row) => {
      const name = $(row).find('h4').text().trim();
      const party = $(row).find('.left-party p').first().text().replace('Party :', '').trim();
      const status = $(row).find('.left-party p').eq(1).text().replace('Status :', '').trim();
      const state = $(row).find('.right-party p').first().text().replace('State :', '').trim();
      const constituency = $(row).find('.right-party p').eq(1).text().replace('Constituency :', '').trim();
      const profileLink = $(row).find('.hover-lay a').attr('href');
      const image = $(row).find('img').attr('src');

      if (name) {
        batch.push({ name, party, status, state, constituency, profileLink, image });
      }
    });

    // Upsert batch into MongoDB (avoid duplicates)
    if (batch.length > 0) {
      const ops = batch.map(cand => ({
        updateOne: {
          filter: { name: cand.name, party: cand.party, constituency: cand.constituency },
          update: { $set: cand },
          upsert: true
        }
      }));

      await Candidate.bulkWrite(ops);
      console.log(`Upserted ${batch.length} candidates from page ${pageNum}`);
    }

    pageNum++;
  }

  console.log("✅ All candidates saved to MongoDB Atlas without duplicates");
  mongoose.connection.close();
})();
