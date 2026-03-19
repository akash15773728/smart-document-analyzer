from flask import Flask, render_template, request, jsonify
import os
from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient
from datetime import datetime

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Global variables for Azure credentials
AZURE_ENDPOINT = None
AZURE_KEY =None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/set-credentials', methods=['POST'])
def set_credentials():
    """Set and validate Azure Document Intelligence credentials"""
    global AZURE_ENDPOINT, AZURE_KEY
    
    data = request.json
    AZURE_ENDPOINT = data.get('endpoint', '').strip()
    AZURE_KEY = data.get('key', '').strip()
    
    if not AZURE_ENDPOINT or not AZURE_KEY:
        return jsonify({'error': 'Missing endpoint or key'}), 400
    
    # Validate credentials
    try:
        client = DocumentAnalysisClient(
            endpoint=AZURE_ENDPOINT,
            credential=AzureKeyCredential(AZURE_KEY)
        )
        return jsonify({'success': True, 'message': 'Credentials validated successfully!'})
    except Exception as e:
        AZURE_ENDPOINT = None
        AZURE_KEY = None
        return jsonify({'error': f'Invalid credentials: {str(e)}'}), 400

@app.route('/api/analyze-document', methods=['POST'])
def analyze_document():
    """Analyze document using Azure Document Intelligence"""
    global AZURE_ENDPOINT, AZURE_KEY
    
    if not AZURE_ENDPOINT or not AZURE_KEY:
        return jsonify({'error': 'Azure credentials not configured. Please set them first.'}), 400
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        # Read file content
        file_content = file.read()
        
        # Initialize Azure Document Intelligence client
        client = DocumentAnalysisClient(
            endpoint=AZURE_ENDPOINT,
            credential=AzureKeyCredential(AZURE_KEY)
        )
        
        # Analyze document
        poller = client.begin_analyze_document(
            "prebuilt-document", 
            document=file_content
        )
        result = poller.result()
        
        # Extract comprehensive information
        analysis_result = {
            'filename': file.filename,
            'timestamp': datetime.now().isoformat(),
            'pages': len(result.pages),
            'content': result.content,
            'key_value_pairs': [],
            'tables': [],
            'entities': [],
            'languages': []
        }
        
        # Extract detected languages
        if hasattr(result, 'languages') and result.languages:
            for lang in result.languages:
                analysis_result['languages'].append({
                    'locale': lang.locale,
                    'confidence': round(lang.confidence * 100, 2) if lang.confidence else 0
                })
        
        # Extract key-value pairs
        if result.key_value_pairs:
            for kv_pair in result.key_value_pairs:
                key_text = kv_pair.key.content if kv_pair.key else ''
                value_text = kv_pair.value.content if kv_pair.value else ''
                confidence = kv_pair.confidence if kv_pair.confidence else 0
                
                if key_text or value_text:  # Only add if there's content
                    analysis_result['key_value_pairs'].append({
                        'key': key_text,
                        'value': value_text,
                        'confidence': round(confidence * 100, 2)
                    })
        
        # Extract tables
        if result.tables:
            for table_idx, table in enumerate(result.tables):
                table_data = {
                    'table_number': table_idx + 1,
                    'rows': table.row_count,
                    'columns': table.column_count,
                    'cells': []
                }
                
                for cell in table.cells:
                    table_data['cells'].append({
                        'row': cell.row_index,
                        'column': cell.column_index,
                        'content': cell.content,
                        'row_span': cell.row_span if hasattr(cell, 'row_span') else 1,
                        'column_span': cell.column_span if hasattr(cell, 'column_span') else 1,
                        'kind': cell.kind if hasattr(cell, 'kind') else 'content'
                    })
                
                analysis_result['tables'].append(table_data)
        
        # Extract entities
        if hasattr(result, 'entities') and result.entities:
            for entity in result.entities:
                analysis_result['entities'].append({
                    'category': entity.category if hasattr(entity, 'category') else 'Unknown',
                    'subcategory': entity.sub_category if hasattr(entity, 'sub_category') else None,
                    'content': entity.content,
                    'confidence': round(entity.confidence * 100, 2) if entity.confidence else 0
                })
        
        # Extract page-level information
        analysis_result['page_details'] = []
        for page in result.pages:
            page_info = {
                'page_number': page.page_number,
                'width': page.width,
                'height': page.height,
                'unit': page.unit,
                'angle': page.angle if hasattr(page, 'angle') else 0,
                'lines': len(page.lines) if hasattr(page, 'lines') else 0,
                'words': len(page.words) if hasattr(page, 'words') else 0
            }
            analysis_result['page_details'].append(page_info)
        
        return jsonify(analysis_result)
    
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/api/analyze-layout', methods=['POST'])
def analyze_layout():
    """Analyze document layout and structure"""
    global AZURE_ENDPOINT, AZURE_KEY
    
    if not AZURE_ENDPOINT or not AZURE_KEY:
        return jsonify({'error': 'Azure credentials not configured'}), 400
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    try:
        file_content = file.read()
        
        client = DocumentAnalysisClient(
            endpoint=AZURE_ENDPOINT,
            credential=AzureKeyCredential(AZURE_KEY)
        )
        
        poller = client.begin_analyze_document("prebuilt-layout", document=file_content)
        result = poller.result()
        
        layout_result = {
            'filename': file.filename,
            'timestamp': datetime.now().isoformat(),
            'pages': len(result.pages),
            'paragraphs': len(result.paragraphs) if hasattr(result, 'paragraphs') else 0,
            'tables': len(result.tables) if hasattr(result, 'tables') else 0,
            'page_details': []
        }
        
        # Extract detailed page information
        for page in result.pages:
            lines_content = [line.content for line in page.lines] if hasattr(page, 'lines') else []
            
            page_info = {
                'page_number': page.page_number,
                'width': page.width,
                'height': page.height,
                'unit': page.unit,
                'angle': page.angle if hasattr(page, 'angle') else 0,
                'lines_count': len(lines_content),
                'lines': lines_content[:50],  # First 50 lines to avoid huge responses
                'words_count': len(page.words) if hasattr(page, 'words') else 0
            }
            layout_result['page_details'].append(page_info)
        
        # Extract paragraph information
        if hasattr(result, 'paragraphs'):
            layout_result['paragraph_roles'] = []
            for para in result.paragraphs[:20]:  # First 20 paragraphs
                layout_result['paragraph_roles'].append({
                    'content': para.content[:200] + ('...' if len(para.content) > 200 else ''),
                    'role': para.role if hasattr(para, 'role') else None
                })
        
        return jsonify(layout_result)
    
    except Exception as e:
        return jsonify({'error': f'Layout analysis failed: {str(e)}'}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Azure Document Intelligence Application")
    print("=" * 60)
    print("Server starting at: http://localhost:5000")
    print("Make sure you have installed required packages:")
    print("  pip install flask azure-ai-formrecognizer")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)