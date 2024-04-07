let codeInput = document.getElementById("code");
let imgInput = document.getElementById("img");
let resultDiv = document.getElementById("result");
let uploadProgress = document.getElementById("uploadProgress");
let progressText = document.getElementById("progressText");
let uform = document.getElementById("uform");
let progressContainer = document.getElementById("progress-container");
let warning = document.getElementById("warnings");
let host = window.location.origin;

function randomCode(length) {
  const txt = "1234567890qwertyuiopasdfghjklzxcvbnm";
  let randomCode = "";

  for (let i = 0; i < length; i++) {
    const randomChar = txt.charAt(Math.floor(Math.random() * txt.length));
    randomCode += randomChar;
  }

  return randomCode;
}
codeInput.value = randomCode(5);
function uploadFile() {
  warning.innerHTML = "";
  if (!codeInput.value || !imgInput.files[0]) {
    warning.innerHTML = "<p>Please provide both code and image.</p>";
    return;
  }
  progressContainer.style.display = "block";
  var formData = new FormData();
  formData.append("code", codeInput.value);
  formData.append("img", imgInput.files[0]);

  var xhr = new XMLHttpRequest();

  xhr.open("POST", "/upload?code=" + codeInput.value, true);

  xhr.upload.onprogress = function (e) {
    if (e.lengthComputable) {
      var percentComplete = Math.round((e.loaded / e.total) * 100);
      uploadProgress.value = percentComplete;
      if (percentComplete == 100) {
        progressText.innerHTML = "Processing...⚙️"
      } else {
        progressText.innerText = percentComplete + "%";
      }
      
    }
  };

  xhr.onload = function () {
    if (xhr.status === 200) {
      try {
        var data = JSON.parse(xhr.responseText);
        uform.style.display = "none";
        if (data.success) {
          progressText.innerHTML = "Completed 🫰🏻"
          resultDiv.style.display = "block";
          const img = data.data;
          // Create input, button, and link elements
          let urlInput = document.createElement("input");
          urlInput.type = "text";
          urlInput.style.color = "#bbadad";
          urlInput.value = `${host}/${img["code"]}`;
          urlInput.id = "urlInput";
          urlInput.disabled = true;

          let copyButton = document.createElement("button");
          copyButton.type = "button";
          copyButton.id = "copyButton";
          copyButton.innerText = "Copy URL";

          let link = document.createElement("button");
          link.onclick = function () {
            window.location.href = host + "/" + img["filename"];
          };
          link.textContent = "Direct link";
          link.style.paddingLeft = "10px";

          resultDiv.innerHTML = "";

          let againButton = document.createElement("button");
          againButton.type = "button";
          againButton.onclick = ShowForm;
          againButton.innerText = "Upload Again";
          resultDiv.appendChild(urlInput);
          resultDiv.appendChild(copyButton);
          resultDiv.appendChild(link);
          resultDiv.appendChild(againButton);
          copyButton.addEventListener("click", copyUrl);
        } else {
          uform.style.display = "block";
          progressContainer.style.display = "none";
          warning.innerHTML = "<p>code is already taken, try again</p>";
        }
      } catch (error) {
        console.error("Error parsing JSON response", error);
        resultDiv.innerText = "Error parsing JSON response.";
      }
    } else {
      resultDiv.innerText = "An error occurred while uploading the file.";
    }
  };

  xhr.send(formData);
}

function ShowForm() {
  uform.style.display = "block";
  codeInput.value = randomCode(5);
  imgInput.value = "";
  resultDiv.style.display = "none";
  progressContainer.style.display = "none";
}

function copyUrl() {
  var urlInput = document.getElementById("urlInput");

  // Create a temporary text area
  var tempInput = document.createElement("textarea");
  tempInput.value = urlInput.value;
  document.body.appendChild(tempInput);

  // Select the text in the text area
  tempInput.select();
  tempInput.setSelectionRange(0, 99999); /* For mobile devices */

  try {
    // Copy the selected text to the clipboard
    document.execCommand("copy");
    console.log("URL copied to clipboard");
    // Optionally, you can change the appearance of the copied text here
    urlInput.style.color = "#4CAF50"; // Green color (you can change it to your desired color)
  } catch (err) {
    console.error("Unable to copy URL to clipboard", err);
  } finally {
    // Remove the temporary text area
    document.body.removeChild(tempInput);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Add event listener to the "Copy URL" button
  var copyButton = document.getElementById("copyButton");
  if (copyButton) {
    copyButton.addEventListener("click", copyUrl);
  }
});
