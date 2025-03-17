export const loadDataToPrinter = (blob: Blob) => {
  const blobURL = URL.createObjectURL(blob)

  const iframe = document.createElement('iframe') //load content in an iframe to print later
  document.body.appendChild(iframe)
 
  iframe.style.display = 'none'
  iframe.src = blobURL
  iframe.onload = function () {
    setTimeout(function () {
      iframe.focus()
      iframe?.contentWindow?.print()
    }, 1)
  }
}
