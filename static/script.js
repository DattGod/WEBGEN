async function generateCode() {
  const promptElement = document.getElementById("prompt");
  const prompt = promptElement.value.trim();
  if (!prompt) {
    alert("Please enter a coding prompt.");
    return;
  }

  try {
    const response = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const result = await response.json();

    if (result.code) {
      // Show generated code
      document.getElementById("outputCode").value = result.code;
      document.getElementById("codeContainer").style.display = "block";

      // Show code in preview iframe
      document.getElementById("previewFrame").srcdoc =
        `<pre style='color: #eee; font-family: monospace; background: #1a1a1a; padding: 20px;'>` +
        result.code.replace(/</g, "&lt;").replace(/>/g, "&gt;") +
        `</pre>`;
      document.getElementById("previewContainer").style.display = "block";

      // ✅ Clear prompt textarea
      promptElement.value = "";
    } else {
      alert("No code generated. Try refining your prompt.");
    }
  } catch (error) {
    alert("Something went wrong while generating code.");
    console.error(error);
  }
}

function startVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("prompt").value = transcript;
  };

  recognition.onerror = function (event) {
    alert("Voice input error: " + event.error);
  };
}

function togglePreview() {
  const preview = document.getElementById("previewContainer");
  preview.style.display = preview.style.display === "none" ? "block" : "none";
}

function downloadCode() {
  const code = document.getElementById("outputCode").value;
  const blob = new Blob([code], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = "generated_code.txt";
  link.click();
}
