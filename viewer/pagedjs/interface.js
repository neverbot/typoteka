document.addEventListener('DOMContentLoaded', (event) => {
    let p = includeHTML();
    p.then(() => {
        interfaceEvents();
    })
   
    


    let flowBook = document.querySelector("#book-content");
    let book_content = flowBook.content;
    let paged = new Paged.Previewer();
    paged.preview(book_content, ["styles/test/style.css"], document.querySelector("#renderbook")).then((flow) => {
        
    });
  });


 



  function  interfaceEvents(){

    let body = document.getElementsByTagName("body")[0];

   
    // set a "unique" filename based on title element, in case several books are opened
    var fileTitle = document.getElementsByTagName("title")[0].text;

        /* BASELINE ---------------------------------------------------------------------------------------------------- 
        ----------------------------------------------------------------------------------------------------------------*/

        /* Set baseline onload */
        let baselineToggle = localStorage.getItem('baselineToggle' + fileTitle);
        let baselineButton = document.querySelector('#label-baseline-toggle');
        let baselineSize = localStorage.getItem('baselineSize' + fileTitle);
        let baselinePosition = localStorage.getItem('baselinePosition');
        let baselineSizeInput = document.querySelector('#size-baseline');
        let baselinePositionInput = document.querySelector('#position-baseline');

        if(baselineToggle == "no-baseline"){
            body.classList.add('no-baseline');
            baselineButton.innerHTML = "see";
        }else if(baselineToggle == "baseline"){
            body.classList.remove('no-baseline');
            document.querySelector("#baseline-toggle").checked = "checked";
            baselineButton.innerHTML = "hide";
        }else{
            body.classList.add('no-baseline');
            localStorage.setItem('baselineToggle' + fileTitle, 'no-baseline');
            baselineButton.innerHTML = "see";
        }

        /* Get baseline size and position on load*/
        if(baselineSize){
            baselineSizeInput.value = baselineSize;
            document.documentElement.style.setProperty('--pagedjs-baseline', baselineSize + 'px');
        }else{
            localStorage.setItem('baselineSize' + fileTitle, baselineSizeInput.value);
        }
        baselinePositionInput.addEventListener("input", (e) => {
        });
        if(baselinePosition){
            baselinePositionInput.value = baselinePosition;
            document.documentElement.style.setProperty('--pagedjs-baseline-position', baselinePosition + 'px');
        }else{
            localStorage.setItem('baselineSPosition', baselinePositionInput.value);
        }




        /* Toggle baseline */
        document.querySelector("#baseline-toggle").addEventListener("input", (e) => {
            if(e.target.checked){
                /* see baseline */
                body.classList.remove('no-baseline');
                localStorage.setItem('baselineToggle' + fileTitle, 'baseline');
                baselineButton.innerHTML = "hide";
            }else{
                /* hide baseline */
                body.classList.add('no-baseline');
                localStorage.setItem('baselineToggle' + fileTitle, 'no-baseline');
                baselineButton.innerHTML = "see";
            }
        });


        /* Change baseline size on input */
        document.querySelector("#size-baseline").addEventListener("input", (e) => {
            document.documentElement.style.setProperty('--pagedjs-baseline', e.target.value + 'px');
            localStorage.setItem('baselineSize'  + fileTitle, baselineSizeInput.value);
        });


        /* Change baseline position on input */
          document.querySelector("#position-baseline").addEventListener("input", (e) => {
            document.documentElement.style.setProperty('--pagedjs-baseline-position', e.target.value + 'px');
            localStorage.setItem('baselinePosition', baselinePositionInput.value);
        });


         /* MARGIN BOXES ---------------------------------------------------------------------------------------------------- 
        ----------------------------------------------------------------------------------------------------------------*/
        let marginButton = document.querySelector('#label-marginbox-toggle');

        body.classList.add('no-marginboxes');
        
        document.querySelector("#marginbox-toggle").addEventListener("input", (e) => {
            if(e.target.checked){
                /* see baseline */
                body.classList.remove('no-marginboxes');
                marginButton.innerHTML = "hide";
            }else{
                /* hide baseline */
                body.classList.add('no-marginboxes');
                marginButton.innerHTML = "see";
            }
        });


        /* Preview ---------------------------------------------------------------------------------------------------- 
        ----------------------------------------------------------------------------------------------------------------*/


        document.querySelector("#preview-toggle").addEventListener("input", (e) => {
            if(e.target.checked){
                /* preview mode */
                body.classList.add('interface-preview');
            }else{
                body.classList.remove('interface-preview');
            }
        });
    
}




function includeHTML() {
    var z, i, file, xhttp;
    /* Loop through a collection of all HTML elements: */
    /*search for elements with a certain atrribute:*/
    let elmnt = document.getElementById("interface-header")
    file = elmnt.getAttribute("w3-include-html");
    let a = new Promise((resolve, reject) => {
        if (file) {
            /* Make an HTTP request using the attribute value as the file name: */
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if (this.status == 200) {elmnt.innerHTML = this.responseText;}
                    if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
                    /* Remove the attribute, and call this function once more: */
                    elmnt.removeAttribute("w3-include-html");
                    resolve();
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            /* Exit the function: */
            return;
        }
    });
    return a;
}









class interfacePaged extends Paged.Handler {
    constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller);
    }

    afterPageLayout(pageElement, page, breakToken){
        let nbr = page.id.replace('page-', '');
        let span = document.querySelector("#nrb-pages");
        span.innerHTML = nbr;
    }


    afterRendered(pages){
        let print = document.querySelector("#button-print");
        print.dataset.ready = 'true';
    }
}
Paged.registerHandlers(interfacePaged);

