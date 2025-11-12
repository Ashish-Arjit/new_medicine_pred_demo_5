let medicineData = [];
let allSymptoms = [];

// Parse CSV file (must be in same folder as index.html)
Papa.parse("demo6.csv", {
  download: true,
  header: true,
  complete: function(results) {
    medicineData = results.data;

    // Extract all unique symptoms from the first column
    const symptomSet = new Set();
    medicineData.forEach(row => {
      const raw = row.Symptom || row.Symptoms || ""; // some CSVs use different header names
      raw.split(",").forEach(s => {
        const clean = s.trim();
        if (clean) symptomSet.add(clean);
      });
    });

    allSymptoms = Array.from(symptomSet).sort();
    renderSymptoms(); // load into UI
    console.log("Loaded symptoms:", allSymptoms.length);
  },
  error: function(err) {
    console.error("Error loading CSV:", err);
  }
});

const symptomList = document.getElementById("symptom-list");
const searchInput = document.getElementById("search");
const output = document.getElementById("output");

function renderSymptoms(filter = "") {
  symptomList.innerHTML = "";
  allSymptoms
    .filter(sym => sym.toLowerCase().includes(filter.toLowerCase()))
    .forEach(sym => {
      const div = document.createElement("div");
      div.innerHTML = `<label><input type="checkbox" value="${sym}"> ${sym}</label>`;
      symptomList.appendChild(div);
    });
}

searchInput.addEventListener("input", e => renderSymptoms(e.target.value));

document.getElementById("clear-btn").addEventListener("click", () => {
  document.getElementById("age").value = "";
  document.getElementById("duration").value = "";
  output.value = "";
  document.querySelectorAll("#symptom-list input[type='checkbox']").forEach(cb => cb.checked = false);
});

document.getElementById("recommend-btn").addEventListener("click", () => {
  const selected = Array.from(document.querySelectorAll("#symptom-list input:checked"))
    .map(cb => cb.value.toLowerCase());

  if (!selected.length) {
    output.value = "Please select at least one symptom.";
    return;
  }

  // Find all rows where any selected symptom is included
  const matches = medicineData.filter(row => {
    const symptomText = (row.Symptom || row.Symptoms || "").toLowerCase();
    return selected.some(sym => symptomText.includes(sym));
  });

  if (matches.length === 0) {
    output.value = "No medicines found for selected symptoms.";
    return;
  }

  const resultText = matches
    .map(row => `${row.Medicine || row.MedicineName || "Unknown"} → for ${row.Symptom || row.Symptoms}`)
    .join("\n");

  output.value = resultText;
});
