const countrySelect = document.querySelector("#countrySelect");
const remoteWorkSelect = document.querySelector("#remoteWorkSelect");
const yearsInput = document.querySelector("#yearsInput");
const predictionForm = document.querySelector("#predictionForm");
const resultCard = document.querySelector("#resultCard");
const resultText = document.querySelector("#resultText");
const errorCard = document.querySelector("#errorCard");
const errorText = document.querySelector("#errorText");

async function loadMetadata() {
  try {
    const response = await fetch("/metadata");
    if (!response.ok) {
      throw new Error("Unable to load metadata.");
    }
    const metadata = await response.json();
    populateSelect(countrySelect, metadata.countries, "Select a country");
    populateSelect(remoteWorkSelect, metadata.remoteWorkOptions, "Select a remote work style");
    return;
  } catch (error) {
    return loadMetadataFromStatic();
  }
}

async function loadMetadataFromStatic() {
  try {
    const response = await fetch("model_metadata.json");
    if (!response.ok) {
      throw new Error("Unable to load metadata from local file.");
    }
    const metadata = await response.json();
    populateSelect(countrySelect, metadata.countries, "Select a country");
    populateSelect(remoteWorkSelect, metadata.remoteWorkOptions, "Select a remote work style");
  } catch (error) {
    showError(
      "Unable to load metadata. Make sure the app is running from the Flask server and that model_metadata.json is present."
    );
  }
}

function populateSelect(selectElement, values, placeholder) {
  selectElement.innerHTML = "";
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  selectElement.appendChild(placeholderOption);

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectElement.appendChild(option);
  });
}

function showResult(message) {
  resultText.textContent = message;
  resultCard.classList.remove("hidden");
  errorCard.classList.add("hidden");
}

function showError(message) {
  errorText.textContent = message;
  errorCard.classList.remove("hidden");
  resultCard.classList.add("hidden");
}

predictionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const country = countrySelect.value;
  const remoteWork = remoteWorkSelect.value;
  const years = parseFloat(yearsInput.value);

  if (!country || !remoteWork || Number.isNaN(years)) {
    showError("Please select country, remote work style, and enter years of experience.");
    return;
  }

  try {
    const response = await fetch("/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Country: country,
        YearsCodePro: years,
        RemoteWork: remoteWork,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Prediction request failed.");
    }

    showResult(`Estimated yearly salary: $${data.predictedSalary.toLocaleString()}`);
  } catch (error) {
    showError(error.message);
  }
});

loadMetadata();
