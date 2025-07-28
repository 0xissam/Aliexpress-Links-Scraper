document.addEventListener('DOMContentLoaded', function () {
  // Get a reference to the "Copy" button
  let scraperButton = document.getElementById("executeButton");

  scraperButton.addEventListener('click', async () => {
    try {
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Get the selected radio button value
      const selectedRadio = document.querySelector('input[name="check"]:checked');

      if (!selectedRadio) {
        alert("Please select a number of links to copy");
        return;
      }

      const selectedValue = selectedRadio.value;
      const maxItemsToCopy = parseInt(selectedValue, 10);

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getme,
        args: [maxItemsToCopy],
      });
    } catch (error) {
      alert(`An error occurred: ${error.message}`);
    }
  });
});

function getme(maxItemsToCopy) {
  try {
    const divElements = document.querySelectorAll('div');
    const modifiedHrefValues = new Set();
    let itemsCopied = 0;

    divElements.forEach((divElement) => {
      if (itemsCopied >= maxItemsToCopy) return;

      const anchorElements = divElement.querySelectorAll('a');
      anchorElements.forEach((anchorElement) => {
        if (itemsCopied >= maxItemsToCopy) return;

        let href = anchorElement.getAttribute('href');
        if (href && href.includes('/item/') && href.includes('.html')) {
          // Add https: if it starts with '//'
          if (href.startsWith('//')) {
            href = 'https:' + href;
          } else if (!href.startsWith('http')) {
            href = 'https://' + location.host + href;
          }

          // Trim everything after ".html"
          href = href.split('.html')[0] + '.html';

          if (!modifiedHrefValues.has(href)) {
            modifiedHrefValues.add(href);
            itemsCopied++;
          }
        }
      });
    });

    const modifiedHrefArray = Array.from(modifiedHrefValues);
    const modifiedHrefString = modifiedHrefArray.join('\n');

    const textarea = document.createElement('textarea');
    textarea.value = modifiedHrefString;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    alert(`Successfully copied ${itemsCopied} clean links.`);
  } catch (error) {
    alert(`An error occurred: ${error.message}`);
  }
}
