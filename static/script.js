// Global state
let credentialsSet = false;
let currentAnalysisResult = null;

// ===== Scroll Functions =====
function scrollToAnalyzer() {
    document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth' });
}

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

// ===== Credentials Management =====
async function saveCredentials() {
    const endpoint = document.getElementById('azureEndpoint').value.trim();
    const key = document.getElementById('azureKey').value.trim();
    const statusDiv = document.getElementById('credentialsStatus');
    
    if (!endpoint || !key) {
        showStatus(statusDiv, 'Please enter both endpoint and API key', 'error');
        return;
    }
    
    showLoading('Validating credentials...');
    
    try {
        const response = await fetch('/api/set-credentials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ endpoint, key })
        });
        
        const data = await response.json();
        hideLoading();
        
        if (response.ok) {
            credentialsSet = true;
            showStatus(statusDiv, '✓ Credentials validated successfully!', 'success');
            
            // Show upload section after 1 second
            setTimeout(() => {
                document.getElementById('credentialsPanel').style.display = 'none';
                document.getElementById('uploadSection').style.display = 'block';
            }, 1000);
        } else {
            showStatus(statusDiv, '✗ ' + data.error, 'error');
        }
    } catch (error) {
        hideLoading();
        showStatus(statusDiv, '✗ Connection failed: ' + error.message, 'error');
    }
}

function showStatus(element, message, type) {
    element.textContent = message;
    element.className = `credentials-status ${type}`;
    element.style.display = 'block';
}

// ===== Settings Modal =====
function openSettings() {
    const modal = document.getElementById('settingsModal');
    const endpoint = document.getElementById('azureEndpoint').value;
    const key = document.getElementById('azureKey').value;
    
    document.getElementById('settingsEndpoint').value = endpoint;
    document.getElementById('settingsKey').value = key;
    
    modal.classList.add('active');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}

function closeModalOnBackdrop(event) {
    if (event.target.id === 'settingsModal') {
        closeSettings();
    }
}

async function updateCredentials() {
    const endpoint = document.getElementById('settingsEndpoint').value.trim();
    const key = document.getElementById('settingsKey').value.trim();
    
    if (!endpoint || !key) {
        alert('Please enter both endpoint and API key');
        return;
    }
    
    showLoading('Updating credentials...');
    
    try {
        const response = await fetch('/api/set-credentials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ endpoint, key })
        });
        
        const data = await response.json();
        hideLoading();
        
        if (response.ok) {
            document.getElementById('azureEndpoint').value = endpoint;
            document.getElementById('azureKey').value = key;
            credentialsSet = true;
            closeSettings();
            alert('Credentials updated successfully!');
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        hideLoading();
        alert('Connection failed: ' + error.message);
    }
}

// ===== Drag and Drop Functionality =====
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('dropzone').classList.add('drag-over');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('dropzone').classList.remove('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('dropzone').classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

// ===== File Processing =====
function processFile(file) {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
        alert('Unsupported file type. Please upload PDF, PNG, JPG, TIFF, or BMP files.');
        return;
    }
    
    // Validate file size (16MB)
    if (file.size > 16 * 1024 * 1024) {
        alert('File size exceeds 16MB limit. Please choose a smaller file.');
        return;
    }
    
    // Update dropzone to show selected file
    const dropzoneContent = document.getElementById('dropzoneContent');
    dropzoneContent.innerHTML = `
        <div style="padding: 20px;">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style="color: var(--accent-green); margin-bottom: 16px;">
                <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="3"/>
                <path d="M16 24l6 6 10-12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3 style="color: var(--accent-green); margin-bottom: 8px;">File Ready</h3>
            <p style="font-weight: 600; margin-bottom: 4px;">${file.name}</p>
            <p style="font-size: 14px; color: var(--text-muted);">${formatFileSize(file.size)}</p>
            <button class="btn-primary" style="margin-top: 20px;" onclick="analyzeDocument()">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 3v12M3 9h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Analyze Document
            </button>
            <button class="btn-secondary" style="margin-top: 12px;" onclick="resetFileSelection()">
                Choose Different File
            </button>
        </div>
    `;
    
    // Store file in global variable
    window.selectedFile = file;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function resetFileSelection() {
    window.selectedFile = null;
    document.getElementById('fileInput').value = '';
    
    document.getElementById('dropzoneContent').innerHTML = `
        <svg class="dropzone-icon" width="72" height="72" viewBox="0 0 72 72" fill="none">
            <path d="M36 14v32M24 32l12-12 12 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 52h44M18 58h36" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
        <h3>Drop your document here</h3>
        <p>or click to browse files</p>
        <div class="file-types">
            <span class="file-badge">PDF</span>
            <span class="file-badge">PNG</span>
            <span class="file-badge">JPG</span>
            <span class="file-badge">TIFF</span>
            <span class="file-badge">BMP</span>
        </div>
        <span class="file-size-limit">Maximum file size: 16MB</span>
    `;
}

// ===== Document Analysis =====
async function analyzeDocument() {
    if (!window.selectedFile) {
        alert('Please select a file first');
        return;
    }
    
    if (!credentialsSet) {
        alert('Please configure Azure credentials first');
        return;
    }
    
    const analysisType = document.querySelector('input[name="analysisType"]:checked').value;
    const formData = new FormData();
    formData.append('file', window.selectedFile);
    
    const endpoint = analysisType === 'document' ? '/api/analyze-document' : '/api/analyze-layout';
    
    showLoading('Analyzing document with Azure AI...');
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        hideLoading();
        
        if (response.ok) {
            currentAnalysisResult = data;
            displayResults(data, analysisType);
        } else {
            alert('Analysis failed: ' + data.error);
        }
    } catch (error) {
        hideLoading();
        alert('Analysis failed: ' + error.message);
    }
}

// ===== Display Results =====
function displayResults(data, analysisType) {
    // Hide upload section, show results
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    
    if (analysisType === 'document') {
        displayDocumentResults(data);
    } else {
        displayLayoutResults(data);
    }
    
    // Switch to overview tab
    switchTab('overview');
}

function displayDocumentResults(data) {
    // Overview Tab
    const overviewTab = document.getElementById('overviewTab');
    overviewTab.innerHTML = `
        <div class="info-grid">
            <div class="info-card">
                <div class="info-card-label">Filename</div>
                <div class="info-card-value" style="font-size: 16px; word-break: break-all;">${data.filename}</div>
            </div>
            <div class="info-card">
                <div class="info-card-label">Pages</div>
                <div class="info-card-value">${data.pages}</div>
            </div>
            <div class="info-card">
                <div class="info-card-label">Tables Found</div>
                <div class="info-card-value">${data.tables.length}</div>
            </div>
            <div class="info-card">
                <div class="info-card-label">Key-Value Pairs</div>
                <div class="info-card-value">${data.key_value_pairs.length}</div>
            </div>
            <div class="info-card">
                <div class="info-card-label">Entities</div>
                <div class="info-card-value">${data.entities.length}</div>
            </div>
            <div class="info-card">
                <div class="info-card-label">Languages</div>
                <div class="info-card-value">${data.languages.length || 1}</div>
            </div>
        </div>
        
        ${data.languages.length > 0 ? `
        <div style="margin-top: 24px;">
            <h4 style="margin-bottom: 12px;">Detected Languages</h4>
            ${data.languages.map(lang => `
                <span class="file-badge" style="margin-right: 8px; margin-bottom: 8px; display: inline-block;">
                    ${lang.locale} (${lang.confidence}% confidence)
                </span>
            `).join('')}
        </div>
        ` : ''}
        
        <div style="margin-top: 24px;">
            <h4 style="margin-bottom: 12px;">Page Details</h4>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Page</th>
                            <th>Size</th>
                            <th>Lines</th>
                            <th>Words</th>
                            <th>Angle</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.page_details.map(page => `
                            <tr>
                                <td>${page.page_number}</td>
                                <td>${page.width.toFixed(1)} × ${page.height.toFixed(1)} ${page.unit}</td>
                                <td>${page.lines}</td>
                                <td>${page.words}</td>
                                <td>${page.angle}°</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // Content Tab
    const contentTab = document.getElementById('contentTab');
    contentTab.innerHTML = `
        <div class="content-box">
            <pre>${data.content || 'No text content extracted'}</pre>
        </div>
    `;
    
    // Tables Tab
    const tablesTab = document.getElementById('tablesTab');
    if (data.tables.length > 0) {
        tablesTab.innerHTML = data.tables.map(table => {
            const tableHTML = renderTable(table);
            return `
                <div style="margin-bottom: 32px;">
                    <h4 style="margin-bottom: 16px;">Table ${table.table_number} (${table.rows} rows × ${table.columns} columns)</h4>
                    ${tableHTML}
                </div>
            `;
        }).join('');
    } else {
        tablesTab.innerHTML = createEmptyState('No tables found in this document');
    }
    
    // Key-Value Pairs Tab
    const kvpTab = document.getElementById('kvpTab');
    if (data.key_value_pairs.length > 0) {
        kvpTab.innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Key</th>
                            <th>Value</th>
                            <th>Confidence</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.key_value_pairs.map(kv => `
                            <tr>
                                <td style="font-weight: 600;">${kv.key || '-'}</td>
                                <td>${kv.value || '-'}</td>
                                <td><span class="confidence-badge">${kv.confidence}%</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        kvpTab.innerHTML = createEmptyState('No key-value pairs found');
    }
    
    // Entities Tab
    const entitiesTab = document.getElementById('entitiesTab');
    if (data.entities.length > 0) {
        entitiesTab.innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Subcategory</th>
                            <th>Content</th>
                            <th>Confidence</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.entities.map(entity => `
                            <tr>
                                <td><span class="file-badge">${entity.category}</span></td>
                                <td>${entity.subcategory || '-'}</td>
                                <td>${entity.content}</td>
                                <td><span class="confidence-badge">${entity.confidence}%</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        entitiesTab.innerHTML = createEmptyState('No entities extracted');
    }
}

function displayLayoutResults(data) {
    // Overview Tab
    const overviewTab = document.getElementById('overviewTab');
    overviewTab.innerHTML = `
        <div class="info-grid">
            <div class="info-card">
                <div class="info-card-label">Filename</div>
                <div class="info-card-value" style="font-size: 16px; word-break: break-all;">${data.filename}</div>
            </div>
            <div class="info-card">
                <div class="info-card-label">Pages</div>
                <div class="info-card-value">${data.pages}</div>
            </div>
            <div class="info-card">
                <div class="info-card-label">Paragraphs</div>
                <div class="info-card-value">${data.paragraphs}</div>
            </div>
            <div class="info-card">
                <div class="info-card-label">Tables</div>
                <div class="info-card-value">${data.tables}</div>
            </div>
        </div>
        
        <div style="margin-top: 24px;">
            <h4 style="margin-bottom: 12px;">Page Layout Details</h4>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Page</th>
                            <th>Size</th>
                            <th>Angle</th>
                            <th>Lines</th>
                            <th>Words</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.page_details.map(page => `
                            <tr>
                                <td>${page.page_number}</td>
                                <td>${page.width.toFixed(1)} × ${page.height.toFixed(1)} ${page.unit}</td>
                                <td>${page.angle}°</td>
                                <td>${page.lines_count}</td>
                                <td>${page.words_count}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        ${data.paragraph_roles && data.paragraph_roles.length > 0 ? `
        <div style="margin-top: 32px;">
            <h4 style="margin-bottom: 12px;">Paragraph Roles</h4>
            ${data.paragraph_roles.map((para, idx) => `
                <div style="background: var(--secondary-bg); padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 3px solid var(--accent-blue);">
                    <div style="font-size: 12px; color: var(--accent-blue); margin-bottom: 4px; font-weight: 600;">
                        ${para.role || 'Content'}
                    </div>
                    <div style="color: var(--text-secondary); font-size: 14px;">
                        ${para.content}
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}
    `;
    
    // Content Tab - Show lines from first page
    const contentTab = document.getElementById('contentTab');
    if (data.page_details && data.page_details.length > 0) {
        contentTab.innerHTML = data.page_details.map(page => `
            <div style="margin-bottom: 32px;">
                <h4 style="margin-bottom: 16px;">Page ${page.page_number} Lines</h4>
                <div class="content-box">
                    <pre>${page.lines.join('\n')}</pre>
                </div>
            </div>
        `).join('');
    } else {
        contentTab.innerHTML = createEmptyState('No content available');
    }
    
    // Hide other tabs for layout analysis
    document.querySelector('[data-tab="tables"]').style.display = 'none';
    document.querySelector('[data-tab="kvp"]').style.display = 'none';
    document.querySelector('[data-tab="entities"]').style.display = 'none';
}

function renderTable(table) {
    // Create a 2D array to hold cell content
    const grid = Array(table.rows).fill(null).map(() => Array(table.columns).fill(''));
    
    // Fill the grid with cell content
    table.cells.forEach(cell => {
        if (cell.row < table.rows && cell.column < table.columns) {
            grid[cell.row][cell.column] = cell.content;
        }
    });
    
    // Generate HTML table
    return `
        <div class="table-container">
            <table class="data-table">
                <tbody>
                    ${grid.map(row => `
                        <tr>
                            ${row.map(cell => `
                                <td>${cell || '-'}</td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function createEmptyState(message) {
    return `
        <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect x="16" y="20" width="32" height="28" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M24 28h16M24 36h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <h4>No Data Available</h4>
            <p>${message}</p>
        </div>
    `;
}

// ===== Tab Switching =====
function switchTab(tabName) {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Add active class to selected tab and panel
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// ===== Reset Analyzer =====
function resetAnalyzer() {
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
    resetFileSelection();
    currentAnalysisResult = null;
    
    // Show hidden tabs again
    document.querySelector('[data-tab="tables"]').style.display = 'block';
    document.querySelector('[data-tab="kvp"]').style.display = 'block';
    document.querySelector('[data-tab="entities"]').style.display = 'block';
}

// ===== Loading Overlay =====
function showLoading(message = 'Processing...') {
    const overlay = document.getElementById('loadingOverlay');
    const messageEl = document.getElementById('loadingMessage');
    if (messageEl) {
        messageEl.textContent = message;
    }
    overlay.style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// ===== Demo Function =====
function showDemo() {
    alert('Demo video coming soon! For now, try uploading a document to see the analysis in action.');
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DocuMind AI Application loaded successfully!');
    console.log('Configure your Azure credentials to get started.');
});