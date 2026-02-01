let analysisData = {
    summary: {},
    elements: [],
    scripts: [],
    links: [],
    images: []
};

function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    
    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function analyzeHTML() {
    const fileInput = document.getElementById('htmlFileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Пожалуйста, выберите HTML файл');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const htmlContent = e.target.result;
        analyzeContent(htmlContent);
    };
    reader.readAsText(file);
}

function analyzeContent(htmlContent) {

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    analysisData = {
        summary: {},
        elements: [],
        scripts: [],
        links: [],
        images: []
    };

    analyzeElements(doc);

    analyzeScripts(doc);

    analyzeLinks(doc);

    analyzeImages(doc);

    analyzeSummary(doc);
    
    displayResults();

    saveAnalysisData();
}

function analyzeElements(doc) {
    const allElements = doc.querySelectorAll('*');
    const elementCount = {};
    
    allElements.forEach(element => {
        const tagName = element.tagName.toLowerCase();
        elementCount[tagName] = (elementCount[tagName] || 0) + 1;
        
        const attributes = {};
        for (let attr of element.attributes) {
            attributes[attr.name] = attr.value;
        }
        
        analysisData.elements.push({
            tag: tagName,
            id: element.id || 'нет',
            class: element.className || 'нет',
            attributes: Object.keys(attributes).length > 0 ? attributes : 'нет'
        });
    });
    
    analysisData.summary.totalElements = allElements.length;
    analysisData.summary.elementTypes = elementCount;
}

function analyzeScripts(doc) {
    const scripts = doc.querySelectorAll('script');
    analysisData.summary.totalScripts = scripts.length;
    
    scripts.forEach(script => {
        const scriptInfo = {
            src: script.src || 'встроенный скрипт',
            type: script.type || 'text/javascript',
            async: script.async ? 'да' : 'нет',
            defer: script.defer ? 'да' : 'нет',
            contentLength: script.textContent.length + ' символов'
        };
        analysisData.scripts.push(scriptInfo);
    });
}

function analyzeLinks(doc) {
    const links = doc.querySelectorAll('a[href]');
    analysisData.summary.totalLinks = links.length;
    
    const linkTypes = {
        internal: 0,
        external: 0,
        anchor: 0,
        email: 0,
        phone: 0
    };
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        let type = 'external';
        
        if (href.startsWith('#')) {
            type = 'anchor';
            linkTypes.anchor++;
        } else if (href.includes('mailto:')) {
            type = 'email';
            linkTypes.email++;
        } else if (href.includes('tel:')) {
            type = 'phone';
            linkTypes.phone++;
        } else if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
            type = 'internal';
            linkTypes.internal++;
        } else {
            linkTypes.external++;
        }
        
        analysisData.links.push({
            href: href,
            text: link.textContent.trim() || 'нет текста',
            type: type,
            target: link.target || '_self'
        });
    });
    
    analysisData.summary.linkTypes = linkTypes;
}

function analyzeImages(doc) {
    const images = doc.querySelectorAll('img');
    analysisData.summary.totalImages = images.length;
    
    images.forEach(img => {
        analysisData.images.push({
            src: img.src || img.getAttribute('src'),
            alt: img.alt || 'нет',
            width: img.width || 'не указана',
            height: img.height || 'не указана',
            loading: img.loading || 'eager'
        });
    });
}

function analyzeSummary(doc) {
    analysisData.summary.title = doc.title || 'нет';
    analysisData.summary.metaDescription = doc.querySelector('meta[name="description"]')?.content || 'нет';
    analysisData.summary.metaKeywords = doc.querySelector('meta[name="keywords"]')?.content || 'нет';
    analysisData.summary.charset = doc.querySelector('meta[charset]')?.getAttribute('charset') || 
                                 doc.querySelector('meta[http-equiv="Content-Type"]')?.content || 'не указана';
}

function displayResults() {
    displaySummary();
    displayElements();
    displayScripts();
    displayLinks();
    displayImages();
}

function displaySummary() {
    const summary = analysisData.summary;
    let html = `
        <table>
            <tr><th>Параметр</th><th>Значение</th></tr>
            <tr><td>Заголовок</td><td>${summary.title}</td></tr>
            <tr><td>Meta Description</td><td>${summary.metaDescription}</td></tr>
            <tr><td>Meta Keywords</td><td>${summary.metaKeywords}</td></tr>
            <tr><td>Кодировка</td><td>${summary.charset}</td></tr>
            <tr><td>Всего элементов</td><td>${summary.totalElements}</td></tr>
            <tr><td>Всего скриптов</td><td>${summary.totalScripts}</td></tr>
            <tr><td>Всего ссылок</td><td>${summary.totalLinks}</td></tr>
            <tr><td>Всего изображений</td><td>${summary.totalImages}</td></tr>
    `;
    
    if (summary.elementTypes) {
        html += `<tr><td colspan="2"><strong>Типы элементов:</strong></td></tr>`;
        for (const [tag, count] of Object.entries(summary.elementTypes)) {
            html += `<tr><td>${tag}</td><td>${count}</td></tr>`;
        }
    }
    
    if (summary.linkTypes) {
        html += `<tr><td colspan="2"><strong>Типы ссылок:</strong></td></tr>`;
        html += `<tr><td>Внутренние</td><td>${summary.linkTypes.internal}</td></tr>`;
        html += `<tr><td>Внешние</td><td>${summary.linkTypes.external}</td></tr>`;
        html += `<tr><td>Якоря</td><td>${summary.linkTypes.anchor}</td></tr>`;
        html += `<tr><td>Email</td><td>${summary.linkTypes.email}</td></tr>`;
        html += `<tr><td>Телефоны</td><td>${summary.linkTypes.phone}</td></tr>`;
    }
    
    html += `</table>`;
    document.getElementById('summaryResults').innerHTML = html;
}

function displayElements() {
    let html = `<table>
        <tr>
            <th>Тег</th>
            <th>ID</th>
            <th>Class</th>
            <th>Атрибуты</th>
        </tr>`;
    
    analysisData.elements.forEach(element => {
        html += `
        <tr>
            <td>${element.tag}</td>
            <td>${element.id}</td>
            <td>${element.class}</td>
            <td>${typeof element.attributes === 'object' ? 
                 Object.entries(element.attributes).map(([k,v]) => `${k}="${v}"`).join(', ') : 
                 element.attributes}</td>
        </tr>`;
    });
    
    html += `</table>`;
    document.getElementById('elementsResults').innerHTML = html;
}

function displayScripts() {
    let html = `<table>
        <tr>
            <th>Источник</th>
            <th>Тип</th>
            <th>Async</th>
            <th>Defer</th>
            <th>Размер</th>
        </tr>`;
    
    analysisData.scripts.forEach(script => {
        html += `
        <tr>
            <td>${script.src}</td>
            <td>${script.type}</td>
            <td>${script.async}</td>
            <td>${script.defer}</td>
            <td>${script.contentLength}</td>
        </tr>`;
    });
    
    html += `</table>`;
    document.getElementById('scriptsResults').innerHTML = html;
}

function displayLinks() {
    let html = `<table>
        <tr>
            <th>Ссылка</th>
            <th>Текст</th>
            <th>Тип</th>
            <th>Target</th>
        </tr>`;
    
    analysisData.links.forEach(link => {
        html += `
        <tr>
            <td>${link.href}</td>
            <td>${link.text}</td>
            <td>${link.type}</td>
            <td>${link.target}</td>
        </tr>`;
    });
    
    html += `</table>`;
    document.getElementById('linksResults').innerHTML = html;
}

function displayImages() {
    let html = `<table>
        <tr>
            <th>Источник</th>
            <th>Alt текст</th>
            <th>Ширина</th>
            <th>Высота</th>
            <th>Загрузка</th>
        </tr>`;
    
    analysisData.images.forEach(img => {
        html += `
        <tr>
            <td>${img.src}</td>
            <td>${img.alt}</td>
            <td>${img.width}</td>
            <td>${img.height}</td>
            <td>${img.loading}</td>
        </tr>`;
    });
    
    html += `</table>`;
    document.getElementById('imagesResults').innerHTML = html;
}

function saveAnalysisData() {
    localStorage.setItem('lastAnalysis', JSON.stringify(analysisData));
}

window.addEventListener('load', function() {
    const savedData = localStorage.getItem('lastAnalysis');
    if (savedData) {
        analysisData = JSON.parse(savedData);
        displayResults();
    }
});