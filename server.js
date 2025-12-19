const express = require('express');
const session = require('express-session');
const cors = require('cors');  // Enable CORS for frontend requests
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/login.html', (req, res) => {
  res.redirect('/login');
});
app.get('/admin.html', (req, res) => {
      res.redirect('/admin');
});

//login handler begins

//session handler begins
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//middleware
app.use(session({
  secret: 'SuperSecret_123', // keep this secure
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
  },
  rolling: true // ⚡ resets cookie timer on activity
}));

//session handler ends
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
// Login endpoint

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users[username];

  if (user && user.password === password) {
    req.session.loggedIn = true;
    req.session.username = username;
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid username or password" });
  }
});


//login handler ends
// check for session and cache control
app.get('/admin', (req, res) => {
  console.log("Session:", req.session); // 🐞 Debug session content

  if (req.session.loggedIn) {
    res.setHeader('Cache-Control', 'no-store'); // 🛑 Prevent browser caching
    res.sendFile(path.join(__dirname, 'public', 'admin.html')); // ✅ Serve admin page
  } else {
    res.redirect('/login.html'); // 🚪 Not logged in? Redirect to login
  }
});
// logout handler
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.log('Error destroying session:', err);
        return res.status(500).send("Logout failed");
      }
      res.redirect('/login.html'); // ✅ Redirect to login page
      console.log("logout successfull");
    });
  });
  const USERS_FILE = path.join(__dirname, 'users.json');
  //load users from file
  function loadUsers() {
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data);
  }
  
  // Save users to file
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\W]{8,12}$/;

  function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  }
  
  app.post("/api/update-password", (req, res) => {
    const { username, oldPassword, newPassword, confirmPassword } = req.body;
  
    if (!req.session.loggedIn) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
  
    const users = loadUsers();
    const user = users[username];
  
    if (!user || user.password !== oldPassword) {
      return res.json({ success: false, message: "Old password is incorrect" });
    }
  
    if (newPassword !== confirmPassword) {
      return res.json({ success: false, message: "Passwords do not match" });
    }
  
    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.json({
        success: false,
        message:
          "Password must be 8-12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }
  
    users[username].password = newPassword;
    saveUsers(users);
    res.json({ success: true, message: "Password updated successfully" });
  });
  

app.use(express.static('public'));

//Display Gallery Configuration starts

const galleryPath = path.join(__dirname, 'gallery'); // Ensure correct path

app.use('/services', express.static(path.join(__dirname, 'services')));

// Serve images from gallery folder
app.use('/gallery', express.static(galleryPath));

// API to list image files
app.get('/api/gallery-images', (req, res) => {
    fs.readdir(galleryPath, (err, files) => {
        if (err) {
            console.error('Error reading gallery directory:', err);
            return res.status(500).json({ error: 'Unable to read gallery' });
        }

        const imageFiles = files
            .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file)) // Filter images
            .map(file => `/gallery/${file}`); // Create accessible URLs

        res.json(imageFiles);
    });
});
// display Gallery configuration ends
// Upload images to gallery API
app.post('/api/gallery/upload', upload.single('image'), (req, res) => {
  const tempPath = req.file.path;
  const originalName = req.file.originalname;
  const targetPath = path.join(galleryPath, originalName);

  fs.rename(tempPath, targetPath, err => {
      if (err) {
          console.error('Upload failed:', err);
          return res.status(500).send('Upload failed');
      }
      res.send('Image uploaded successfully</h2><a href="/admin.html">Go Back</a>');
  });
});

// Delete images from gallery API
app.delete('/api/gallery/:filename', (req, res) => {
  const filePath = path.join(galleryPath, req.params.filename);
  fs.unlink(filePath, err => {
      if (err) {
          console.error('Delete failed:', err);
          return res.status(500).send('Delete failed');
      }
      res.send('Image deleted successfully');
  });
});
//Display Services configuration starts

app.get('/api/services', (req, res) => {
    const servicesDir = path.join(__dirname, 'services');

    fs.readdir(servicesDir, (err, serviceFolders) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to read services directory' });
        }

        let services = [];
        serviceFolders.forEach(serviceFolder => {
            const servicePath = path.join(servicesDir, serviceFolder);
            if (fs.statSync(servicePath).isDirectory()) {
                const files = fs.readdirSync(servicePath);

                // Find image file
                const imageFile = files.find(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
                const imagePath = imageFile ? `/services/${serviceFolder}/${imageFile}` : '';

                // Read title
                const titlePath = path.join(servicePath, 'title.txt');
                const title = fs.existsSync(titlePath) ? fs.readFileSync(titlePath, 'utf8').trim() : 'No title';

                // Read description
                const descriptionPath = path.join(servicePath, 'description.txt');
                const description = fs.existsSync(descriptionPath) ? fs.readFileSync(descriptionPath, 'utf8').trim() : 'No description available';

                services.push({ image: imagePath, title, description });
            }
        });

        res.json(services);
    });
});

app.get('/check-session', (req, res) => {
    res.json({ loggedIn: !!req.session.loggedIn });
  });

//Add-Services
app.use(express.urlencoded({ extended: true }));

// Setup multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = 'temp_uploads';
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const serviceUpload = multer({ storage }); // 👈 renamed from 'upload' to 'serviceUpload'

// Handle form submission
app.post('/add-service', serviceUpload.single('image'), (req, res) => {
  const { title, description } = req.body;
  const image = req.file;

  const servicesDir = path.join(__dirname, 'services');
  if (!fs.existsSync(servicesDir)) fs.mkdirSync(servicesDir);

  const existingFolders = fs.readdirSync(servicesDir).filter(name => name.startsWith('service'));
  const newIndex = existingFolders.length + 1;
  const newServicePath = path.join(servicesDir, `service${newIndex}`);

  // Create new folder
  fs.mkdirSync(newServicePath);

  // Save title.txt
  fs.writeFileSync(path.join(newServicePath, 'title.txt'), title);

  // Save description.txt
  fs.writeFileSync(path.join(newServicePath, 'description.txt'), description);

  // Move image file
  const imageExt = path.extname(image.originalname);
  const destImagePath = path.join(newServicePath, `image${imageExt}`);
  fs.renameSync(image.path, destImagePath);

  res.send(`<h2>Service Added Successfully!</h2><a href="/admin.html">Go Back</a>`);
});
//delete service
// Route to get existing services
app.get('/services', (req, res) => {
  const servicesDir = path.join(__dirname, 'services');
  if (!fs.existsSync(servicesDir)) return res.json([]);

  const folders = fs.readdirSync(servicesDir).filter(f => f.startsWith('service'));
  const services = folders.map(folder => {
    const titlePath = path.join(servicesDir, folder, 'title.txt');
    let title = folder;
    if (fs.existsSync(titlePath)) {
      title = fs.readFileSync(titlePath, 'utf-8');
    }
    return { folder, title };
  });

  res.json(services);
});
app.delete('/delete-service/:folderName', (req, res) => {
  const folderName = req.params.folderName;
  const folderPath = path.join(__dirname, 'services', folderName);

  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
    res.json({ message: 'Deleted successfully' });
  } else {
    res.status(404).json({ message: 'Service not found' });
  }
});
//Display Servives configuration ends
// Start server
app.listen(3000, () => console.log('Server running on port 3000'));
