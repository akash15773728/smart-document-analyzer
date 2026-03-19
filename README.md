# 🚀 DocuMind AI - Azure Document Intelligence Application

A stunning web application for analyzing documents using Azure Document Intelligence (formerly Form Recognizer). Features a modern, animated UI with drag-and-drop file upload, real-time document analysis, and beautiful data visualization.

## ✨ Features

- **🎨 Beautiful Modern UI**: Gradient backgrounds, smooth animations, and responsive design
- **📄 Drag & Drop Upload**: Easy file upload with visual feedback
- **🤖 AI-Powered Analysis**: Extract text, tables, key-value pairs, and entities
- **📊 Multiple Analysis Modes**: Document analysis and layout analysis
- **🌍 Multi-Language Support**: Process documents in 150+ languages
- **📈 Real-time Results**: Interactive result display with tabbed navigation
- **🔐 Secure Credentials**: Configurable Azure credentials with validation

## 🛠️ Prerequisites

Before you begin, ensure you have:

1. **Python 3.8+** installed on your system
2. **Azure Account** with Document Intelligence resource created
3. **Azure Document Intelligence**:
   - Endpoint URL (e.g., `https://your-resource.cognitiveservices.azure.com/`)
   - API Key (found in Azure Portal under "Keys and Endpoint")

## 📦 Installation

### Step 1: Clone or Download Files

Make sure you have all the following files:
```
your-project-folder/
├── app.py
├── requirements.txt
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

### Step 2: Install Dependencies

Open terminal/command prompt in your project folder and run:

```bash
pip install -r requirements.txt
```

Or install packages individually:
```bash
pip install Flask==3.0.0
pip install azure-ai-formrecognizer==3.3.2
pip install azure-core==1.29.5
```

## 🚀 Running the Application

### Start the Server

```bash
python app.py
```

You should see output like:
```
============================================================
🚀 Azure Document Intelligence Application
============================================================
Server starting at: http://localhost:5000
Make sure you have installed required packages:
  pip install flask azure-ai-formrecognizer
============================================================
 * Serving Flask app 'app'
 * Debug mode: on
```

### Access the Application

Open your web browser and navigate to:
```
http://localhost:5000
```

## 🎯 How to Use

### 1. Configure Azure Credentials

On first launch:
1. Enter your **Azure Endpoint URL** (e.g., `https://your-resource.cognitiveservices.azure.com/`)
2. Enter your **API Key** from Azure Portal
3. Click **"Save & Validate Credentials"**
4. Wait for validation confirmation

### 2. Upload a Document

Once credentials are set:
1. **Drag and drop** a file onto the upload area, OR
2. **Click** the upload area to browse files
3. Supported formats: PDF, PNG, JPG, TIFF, BMP (max 16MB)

### 3. Choose Analysis Type

Select one of two analysis modes:
- **Document Analysis**: Extract text, tables, key-value pairs, and entities
- **Layout Analysis**: Focus on document structure and formatting

### 4. View Results

Results are organized in tabs:
- **Overview**: Summary statistics and metadata
- **Content**: Full extracted text
- **Tables**: Structured table data
- **Key-Value Pairs**: Form fields and values
- **Entities**: Detected entities (dates, names, addresses, etc.)

## 🎨 UI Features

- **Animated Hero Section**: Dynamic gradient orbs and grid patterns
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Easy on the eyes with modern color scheme
- **Loading States**: Visual feedback during processing
- **Error Handling**: Clear error messages and guidance
- **Settings Modal**: Update credentials anytime

## 📝 Getting Azure Credentials

### Create Azure Document Intelligence Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"**
3. Search for **"Form Recognizer"** or **"Document Intelligence"**
4. Click **"Create"**
5. Fill in:
   - Subscription
   - Resource Group (create new or use existing)
   - Region (choose closest to you)
   - Name (unique name for your resource)
   - Pricing Tier (F0 for free tier, or S0 for standard)
6. Click **"Review + Create"**, then **"Create"**

### Get Your Credentials

1. Once deployed, go to your resource
2. Click **"Keys and Endpoint"** in the left menu
3. Copy:
   - **Endpoint**: The URL (e.g., `https://your-name.cognitiveservices.azure.com/`)
   - **Key 1** or **Key 2**: Either key works

## 🔧 Troubleshooting

### Common Issues

**Error: "Invalid credentials"**
- Double-check your endpoint URL and API key
- Ensure endpoint ends with `/` 
- Verify the resource is active in Azure Portal

**Error: "File too large"**
- Maximum file size is 16MB
- Compress or resize your document

**Error: "Connection refused"**
- Make sure Flask server is running
- Check if port 5000 is available
- Try `http://127.0.0.1:5000` instead of `localhost`

**Empty results**
- Some documents may not have tables or key-value pairs
- Try the other analysis mode
- Ensure document is readable (not corrupted)

### Port Already in Use

If port 5000 is taken, edit `app.py` and change the last line:
```python
app.run(debug=True, host='0.0.0.0', port=5001)  # Change to different port
```

## 📊 Supported Document Types

- **PDFs**: Single or multi-page documents
- **Images**: PNG, JPG, JPEG, TIFF, BMP
- **Languages**: 150+ languages including English, Spanish, French, German, Chinese, Arabic, Hindi, and more
- **Content Types**: Printed text, handwriting, tables, forms, receipts, invoices

## 🔒 Security Notes

- Credentials are stored in memory only (not saved to disk)
- Use environment variables for production deployments
- Never commit API keys to version control
- Consider using Azure Key Vault for production

## 🌟 Advanced Usage

### Custom Analysis Types

The application uses these Azure models:
- `prebuilt-document`: General document analysis
- `prebuilt-layout`: Layout and structure analysis

To use other models, modify the `begin_analyze_document()` calls in `app.py`:
- `prebuilt-invoice`: For invoices
- `prebuilt-receipt`: For receipts
- `prebuilt-id-document`: For ID cards
- `prebuilt-business-card`: For business cards

### Update Settings Anytime

Click the **Settings** button in the navigation bar to update your Azure credentials without restarting the application.

## 📄 File Structure

```
DocuMind AI/
│
├── app.py                  # Flask backend (Python)
├── requirements.txt        # Python dependencies
├── README.md              # This file
│
├── templates/
│   └── index.html         # HTML template
│
└── static/
    ├── style.css          # Styling (CSS)
    └── script.js          # Frontend logic (JavaScript)
```

## 🎓 Learn More

- [Azure Document Intelligence Documentation](https://learn.microsoft.com/azure/ai-services/document-intelligence/)
- [Azure Python SDK](https://learn.microsoft.com/python/api/overview/azure/ai-formrecognizer-readme)
- [Flask Documentation](https://flask.palletsprojects.com/)

## 💡 Tips

- **Better Results**: Use high-quality, well-lit scans
- **Tables**: Works best with clearly defined table borders
- **Handwriting**: Modern handwriting recognition included
- **Batch Processing**: Upload documents one at a time for now

## 🐛 Known Limitations

- One document at a time (no batch upload yet)
- 16MB file size limit
- Requires active internet connection
- Azure API rate limits apply (check your tier)

## 🚀 Future Enhancements

- Batch document processing
- Export results to JSON/CSV
- Document comparison
- Custom model training
- File history and management

## 📞 Support

For Azure-specific issues:
- [Azure Support](https://azure.microsoft.com/support/)
- [Azure Document Intelligence Forum](https://learn.microsoft.com/answers/topics/azure-form-recognizer.html)

## 📜 License

This application is provided as-is for educational and commercial use.
Azure Document Intelligence usage is subject to Azure terms and pricing.

---

**Made with ❤️ using Azure AI, Flask, and Modern Web Technologies**

Enjoy analyzing your documents! 🎉
