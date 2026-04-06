from django.shortcuts import render
from django.http import HttpResponse
import os

def home(request):
    """Serve the exciting homepage"""
    # Get the path to the parent directory where HTML files are located
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    html_file_path = os.path.join(base_dir, 'index-exciting.html')
    
    try:
        with open(html_file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        return HttpResponse(html_content, content_type='text/html')
    except FileNotFoundError:
        return HttpResponse(f"""
        <h1>Welcome to Happy Living</h1>
        <p>Debug info:</p>
        <p>Base directory: {base_dir}</p>
        <p>Looking for file: {html_file_path}</p>
        <p>File exists: {os.path.exists(html_file_path)}</p>
        <p><a href="/improved/">Try Improved Version</a></p>
        <p><a href="/admin/">Admin Panel</a></p>
        """, content_type='text/html')

def improved_home(request):
    """Serve the improved homepage"""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    html_file_path = os.path.join(base_dir, 'index-improved.html')
    
    try:
        with open(html_file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        return HttpResponse(html_content, content_type='text/html')
    except FileNotFoundError:
        return HttpResponse(f"Improved homepage not found at {html_file_path}", status=404)

def student_dashboard(request):
    """Serve student dashboard"""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    html_file_path = os.path.join(base_dir, 'student', 'dashboard-improved.html')
    
    try:
        with open(html_file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        return HttpResponse(html_content, content_type='text/html')
    except FileNotFoundError:
        return HttpResponse(f"Student dashboard not found at {html_file_path}", status=404)

def student_payments(request):
    """Serve student payments page"""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    html_file_path = os.path.join(base_dir, 'student', 'payments-improved.html')
    
    try:
        with open(html_file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        return HttpResponse(html_content, content_type='text/html')
    except FileNotFoundError:
        return HttpResponse(f"Student payments page not found at {html_file_path}", status=404)

def student_login(request):
    """Serve student login page"""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    html_file_path = os.path.join(base_dir, 'student', 'login-improved.html')
    
    try:
        with open(html_file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        return HttpResponse(html_content, content_type='text/html')
    except FileNotFoundError:
        return HttpResponse(f"Student login page not found at {html_file_path}", status=404)

def forgot_password(request):
    """Serve forgot password page"""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    html_file_path = os.path.join(base_dir, 'forgot-password-fixed.html')
    
    try:
        with open(html_file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        return HttpResponse(html_content, content_type='text/html')
    except FileNotFoundError:
        return HttpResponse(f"Forgot password page not found at {html_file_path}", status=404)

def debug_info(request):
    """Debug endpoint to show file paths"""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    files_to_check = [
        'index-exciting.html',
        'index-improved.html',
        'student/dashboard-improved.html',
        'student/payments-improved.html',
        'css/style-exciting.css',
        'css/style-improved.css'
    ]
    
    debug_info = f"""
    <h1>Debug Information</h1>
    <p><strong>Base Directory:</strong> {base_dir}</p>
    <h2>File Status:</h2>
    <ul>
    """
    
    for file_path in files_to_check:
        full_path = os.path.join(base_dir, file_path)
        exists = os.path.exists(full_path)
        debug_info += f"<li>{file_path}: {'✅ EXISTS' if exists else '❌ NOT FOUND'}</li>"
    
    debug_info += "</ul>"
    debug_info += f"<h2>Directory Listing:</h2><pre>{os.listdir(base_dir)}</pre>"
    
    return HttpResponse(debug_info, content_type='text/html')
