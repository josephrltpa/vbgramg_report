# File Upload Setup Guide

## ✅ What's New

The wagelist upload feature now supports **direct file uploads** instead of just pasting links!

### Features:
- 📁 **Browse and upload files** directly from your computer
- 📄 **Supported formats**: PDF, Excel (.xlsx, .xls), HTML
- 🔄 **Update existing files** - automatically replaces old files
- 👁️ **Preview current file** - see what's currently uploaded
- 📥 **Download button** - easy access for village users

---

## 🚀 Setup Instructions

### Step 1: Create Storage Bucket in Supabase

1. Go to your **Supabase Dashboard**
2. Click on **Storage** in the left sidebar
3. Click **"New Bucket"**
4. Enter bucket name: `wagelists`
5. Toggle **"Public bucket"** to ON
6. Click **"Create bucket"**

### Step 2: Run Storage Policies SQL

1. Go to **SQL Editor** in Supabase
2. Click **"New Query"**
3. Copy and paste the contents of `supabase-storage-setup.sql`
4. Click **"Run"**

This will:
- Make the bucket publicly readable (so village users can download)
- Allow authenticated users to upload/update/delete files
- Set proper security policies

### Step 3: Test the Upload

1. **Login as admin** (`admin` / `admin123`)
2. Go to **Demands** tab
3. Select a village and month
4. You'll see the **"Village Wagelist"** section
5. Click the file input and select a PDF/Excel/HTML file
6. Click **"Upload"** button
7. You'll see the file being uploaded with a progress indicator
8. Once uploaded, you'll see "Current wagelist uploaded" with a View button

### Step 4: Test as Village User

1. **Logout** and login as a village user (e.g., `buhban` / `vec123`)
2. Go to **Demands** tab
3. You'll see the **"Village Wagelist"** section
4. If admin uploaded a file, you'll see a **"Download Wagelist"** button
5. Click it to view/download the file

---

## 📋 How It Works

### For Admin (Computer Assistant):
1. **Browse file** - Click the file input to select from your computer
2. **See selection** - Shows file name and size
3. **Upload** - Click upload button, file is uploaded to Supabase Storage
4. **Auto-cleanup** - If updating, old file is automatically deleted
5. **View current** - See what's currently uploaded with date

### For Village Users:
1. **See status** - Shows if wagelist is uploaded or not
2. **Download** - Click download button to view the file
3. **No upload option** - Only admin can upload

---

## 🔒 Security

- Files are stored in Supabase Storage (encrypted at rest)
- Public read access (anyone with the link can view)
- Only authenticated users can upload/update/delete
- File paths include village/year/month for organization
- Unique filenames prevent conflicts

---

## 💾 Storage Limits

**Supabase Free Tier:**
- 1 GB storage total
- 2 GB bandwidth per month

**Estimated file sizes:**
- PDF wagelist: ~500 KB - 2 MB
- Excel file: ~200 KB - 1 MB
- HTML file: ~100 KB - 500 KB

**Capacity:** You can store approximately 500-2000 wagelist files before hitting the 1 GB limit.

---

## 🎯 File Organization

Files are automatically organized in this structure:
```
wagelists/
  └── {village}/
      └── {year}/
          └── {month}/
              └── {village}_{year}_{month}_{timestamp}.{ext}
```

Example:
```
wagelists/
  └── Buhban/
      └── 2026/
          └── 1/
              └── Buhban_2026_1_1735689234567.pdf
```

---

## 🐛 Troubleshooting

### "Upload failed" error
- Check if storage bucket exists
- Verify storage policies are set up correctly
- Check browser console for detailed error

### "Download not working"
- Verify the file URL is accessible
- Check if file was successfully uploaded
- Try refreshing the page

### File too large
- Supabase free tier has no file size limit per file
- But consider user experience - large files take longer to upload/download
- Recommended: Keep files under 5 MB

---

## 📝 Next Steps

After testing:
1. ✅ Push code to GitHub
2. ✅ Wait for Vercel to redeploy
3. ✅ Test file upload as admin
4. ✅ Test download as village user
5. ✅ Try updating an existing file

---

## 💡 Tips

- **File naming**: Use descriptive names for easy identification
- **File size**: Compress PDFs if possible to save storage
- **Backup**: Keep local copies of important files
- **Multiple formats**: You can upload different formats for different months
- **Update vs Replace**: Updating replaces the old file automatically

---

## 🎉 Benefits Over Link Pasting

✅ **No broken links** - Files are stored securely
✅ **No access issues** - No need to manage sharing permissions
✅ **Automatic cleanup** - Old files are deleted when updating
✅ **Better UX** - Users can browse files instead of copying links
✅ **Version control** - Timestamp in filename prevents conflicts
✅ **Reliable** - Files are always available, no external dependencies
