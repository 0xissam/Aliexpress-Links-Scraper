document.addEventListener('DOMContentLoaded', function () {
  // Get a reference to the "Copy" button
  let scraperButton = document.getElementById("executeButton");

  scraperButton.addEventListener('click', async () => {
    try {
      let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

      // Get the selected radio button value
      const selectedRadio = document.querySelector('input[name="check"]:checked');

      if (!selectedRadio) {
        // Handle the case where no radio button is selected
        alert("Please select a number of links to copy");
        return;
      }

      const selectedValue = selectedRadio.value;

      // Convert the selected value to a number and set it as maxItemsToCopy
      const maxItemsToCopy = parseInt(selectedValue, 10);

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getme,
        args: [maxItemsToCopy], // Pass the maxItemsToCopy value as an argument
      });
    } catch (error) {
      alert(`An error occurred: ${error.message}`);
    }
  });
});

function getme(maxItemsToCopy) {
  try {
    const divElements = document.querySelectorAll('div');
    const modifiedHrefValues = new Set(); // Use a Set to store unique hrefs

    var itemsCopied = 0; // Initialize a counter for copied items

    divElements.forEach((divElement) => {
      if (itemsCopied >= maxItemsToCopy) {
        return; // Stop processing when we've copied enough items
      }

      const anchorElements = divElement.querySelectorAll('a');
      anchorElements.forEach((anchorElement) => {
        if (itemsCopied >= maxItemsToCopy) {
          return; // Stop processing when we've copied enough items
        }

        const href = anchorElement.getAttribute('href');
        if (href && href.includes('/item/') && !modifiedHrefValues.has(`https:${href}`)) {
          modifiedHrefValues.add(`https:${href}`);
          itemsCopied++; // Increment the counter for copied items
        }
      });
    });

    const modifiedHrefArray = Array.from(modifiedHrefValues); // Convert Set to array
    const modifiedHrefString = modifiedHrefArray.join('\n');

    const textarea = document.createElement('textarea');
    textarea.value = modifiedHrefString;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    alert(`Successfully copied ${itemsCopied} links.`);
  } catch (error) {
    alert(`An error occurred: ${error.message}`);
  }
}
