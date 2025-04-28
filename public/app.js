const isAdmin = !!document.getElementById('uploadForm');
function toggleNav() {
    const nav = document.querySelector('.nav-bar');
    nav.classList.toggle('active');
}

// login handler
function validateLogin() {
    event.preventDefault(); // Prevent form refresh
  
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
  
    // Check if an error element already exists, or create one
    let errorElement = document.getElementById("error-message");
    if (!errorElement) {
      errorElement = document.createElement("p");
      errorElement.id = "error-message";
      errorElement.style.color = "red";
      errorElement.style.textAlign = "center";
  
      // Insert right below the form (or wherever you'd like)
      const form = document.querySelector("form");
      form.parentNode.insertBefore(errorElement, form);
    }
  
    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          window.location.href = "admin.html";
        } else {
          errorElement.textContent = result.message;
        }
      })
      .catch(error => {
        errorElement.textContent = "Something went wrong. Please try again.";
        console.error("Login error:", error);
      });
  }
// for nav loading properly
document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 120, // Adjust based on header height
                behavior: "smooth"
            });
        }
    });
});
function openModal() {
    var modal = new bootstrap.Modal(document.getElementById('exampleModal'));
    modal.show();
}
let currentIndex = 0; //for gallery
let imagesArray = []; //for gallery

function openLightbox(index) {
    currentIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    lightboxImage.src = imagesArray[currentIndex];
    lightbox.style.display = 'flex';
}

// Navigate between images using keyboard arrows left and right
function prevImage() {
    currentIndex = (currentIndex - 1 + imagesArray.length) % imagesArray.length;
    document.getElementById('lightbox-image').src = imagesArray[currentIndex];
}
function nextImage() {
    currentIndex = (currentIndex + 1) % imagesArray.length;
    document.getElementById('lightbox-image').src = imagesArray[currentIndex];
}
//navigate between images using lightbox buttons
document.getElementById('prev').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + imagesArray.length) % imagesArray.length;
    document.getElementById('lightbox-image').src = imagesArray[currentIndex];
});

document.getElementById('next').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % imagesArray.length;
    document.getElementById('lightbox-image').src = imagesArray[currentIndex];
});

// Close lightbox
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('lightbox').style.display = 'none';
});

// Close on clicking outside
document.getElementById('lightbox').addEventListener('click', (event) => {
    if (event.target === document.getElementById('lightbox')) {
        document.getElementById('lightbox').style.display = 'none';
    }
});

// Close on Escape key press
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        document.getElementById('lightbox').style.display = 'none';
    } else if (event.key === "ArrowLeft") {
        prevImage();
    } else if (event.key === "ArrowRight") {
        nextImage();
    }
});


function map(){
    var map = L.map("map").setView([17.50185384358071, 78.54107151866575], 15); // Replace with your coordinates
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
        L.marker([17.50185384358071, 78.54107151866575]).addTo(map).bindPopup("Riya Surveyors").openPopup();
}
function recenterMap() {
    map.setView([17.50185384358071, 78.54107151866575], 13); // Reset to original location & zoom
}
function getDirections() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var userLat = position.coords.latitude;
            var userLng = position.coords.longitude;
            
            // Open Google Maps with Directions
            var googleMapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/17.50185384358071, 78.54107151866575`;
            window.open(googleMapsUrl, "_blank");
        }, function(error) {
            alert("Geolocation not supported or permission denied.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}
map()

// ----- GALLERY -----
function loadGallery() {
  const galleryContainer = document.querySelector('.gallery-images') || document.getElementById('galleryList');
  const uploadForm = document.getElementById('uploadForm');
  if (!galleryContainer) return; // Exit if gallery container doesn't exist

  fetch('/api/gallery-images')
      .then(res => res.json())
      .then(images => {
          galleryContainer.innerHTML = '';
          imagesArray = images;
          console.log(images.length);

          images.forEach((imgPath, index) => {
              const img = document.createElement('img');
              img.src = imgPath;
              img.alt = imgPath.split('/').pop();

              const wrapper = document.createElement('div');
              wrapper.appendChild(img);

              if (isAdmin) {
                  const filename = imgPath.split('/').pop();
                  const delBtn = document.createElement('button');
                  delBtn.textContent = 'Delete';
                  delBtn.addEventListener('click', () => {
                      fetch(`/api/gallery/${filename}`, {
                          method: 'DELETE'
                      })
                      .then(res => res.text())
                      .then(msg => {
                          alert(msg);
                          loadGallery();
                      });
                  });
                  wrapper.appendChild(delBtn);
                  img.style.width = "100px";
              } else {
                  img.dataset.index = index;
                  img.addEventListener('click', () => openLightbox(index));
              }

              galleryContainer.appendChild(wrapper);
          });
      })
      .catch(err => console.error('Error loading gallery:', err));
}

// if (isAdmin && uploadForm) {
//   function handleImageUpload() {
//     const uploadForm = document.getElementById('uploadForm');
//     console.log(uploadForm)
//     if (!uploadForm) return;
  
//     const formData = new FormData(uploadForm);
//     console.log("Upload button clicked!");
  
//     fetch('/api/gallery/upload', {
//       method: 'POST',
//       body: formData
//     })
//     .then(res => res.text())
//     .then(msg => {
//       alert(msg);
//       uploadForm.reset();
//       loadGallery();
//     })
//     .catch(err => {
//       console.error('Upload error:', err);
//       alert('Failed to upload image');
//     });
//   }
  
// }


// ----- SERVICES -----
function loadServices() {
  const servicesContainer = document.querySelector('.services-list');
  if (!servicesContainer) return;

  fetch('/api/services')
  .then(response => response.json())
  .then(services => {
      servicesContainer.innerHTML = '';
      services.forEach(service => {
          const serviceDiv = document.createElement('div');
          serviceDiv.classList.add('service');

          const img = document.createElement('img');
          img.src = service.image;
          img.alt = service.title;

          const title = document.createElement('h3');
          title.textContent = service.title;

          const description = document.createElement('p');
          description.textContent = service.description;

          serviceDiv.appendChild(img);
          serviceDiv.appendChild(title);
          serviceDiv.appendChild(description);
          servicesContainer.appendChild(serviceDiv);
      });
  })
  .catch(error => console.error('Error loading services:', error));
}

function loadServiceCheckboxes() {
  const checkboxesContainer = document.querySelector('.services-checkbox-list');
  if (!checkboxesContainer) return;

  fetch('/api/services')
  .then(response => response.json())
  .then(services => {
      checkboxesContainer.innerHTML = '';
      services.forEach((service, index) => {
          const formGroup = document.createElement('div');
          formGroup.classList.add('form-group-service');

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = `service-${index}`;
          checkbox.name = 'service';
          checkbox.value = service.title;

          const label = document.createElement('label');
          label.setAttribute("for", checkbox.id);
          label.textContent = service.title;

          formGroup.appendChild(checkbox);
          formGroup.appendChild(label);
          checkboxesContainer.appendChild(formGroup);
      });
  })
  .catch(error => console.error('Error loading service checkboxes:', error));
}

// Call all initializers
loadGallery();
loadServices();
loadServiceCheckboxes();


function logout() {
    console.log("inside logut");
    fetch('/logout')
      .then(res => {
        if (res.redirected) {
          window.location.href = res.url; // Redirects to login.html
        } else {
          window.location.href = '/login.html'; // Fallback
        }
      })
      .catch(error => console.error('Logout error:', error));
  }
  //redirect to admin page if already have a active session
  document.getElementById('loginLink').addEventListener('click', function (e) {
    e.preventDefault(); // Stop the default link behavior

    fetch('/check-session')
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn) {
          // Already logged in? Go to admin
          window.location.href = '/admin';
        } else {
          // Not logged in? Go to login
          window.location.href = '/login.html';
        }
      })
      .catch(err => {
        console.error('Session check failed:', err);
        window.location.href = '/login.html'; // fallback
      });
  });

//Update Password
// Open modal
function myProfile() {
document.getElementById('profileLink').addEventListener('click', () => {
    document.getElementById('profileModal').style.display = 'block';
  });
} 
  // Close modal
  function closeProfileModal() {
  document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('profileModal').style.display = 'none';
    document.getElementById('updatePasswordSection').style.display = 'none';
  });
  } 
  // Show password update form
function updateform() {
  document.getElementById('showUpdateForm').addEventListener('click', () => {
    document.getElementById('updatePasswordSection').style.display = 'block';
  });
}
  // Handle password update
function UpdatePassword() {
  document.getElementById('updatePasswordBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
  
    const response = await fetch('/api/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, oldPassword, newPassword, confirmPassword })
    });
  
    const result = await response.json();
    document.getElementById('updateMsg').textContent = result.message;
  
    if (result.success) {
      alert("Password updated successfully!");
      document.getElementById('profileModal').style.display = 'none';
    }
  });
}
//Update Gallery
function OpenGallery() {
  event.preventDefault();
  const modal = document.getElementById('galleryModal');
  const closeBtn = modal.querySelector('.close');

  modal.style.display = 'block';
  loadGallery(); // Load when modal opens

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}
//checkbox validation for service form
// document.addEventListener('DOMContentLoaded', () => {
//   const form = document.getElementById('serviceform');
//   const errorMessage = document.createElement('p'); // Create a paragraph element for error message
//   errorMessage.style.color = 'red'; // Style it (red text color)
//   errorMessage.style.display = 'none'; // Hide it initially

//   form.appendChild(errorMessage); // Append the error message to the form

//   form.addEventListener('submit', function(event) {
//     const checkboxes = form.querySelectorAll('input[type="checkbox"][name="service"]');
//     const atLeastOneChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

//     if (!atLeastOneChecked) {
//       event.preventDefault(); // Stop form submission
//       errorMessage.textContent = 'Please select at least one service before submitting the form.'; // Show the error message
//       errorMessage.style.display = 'block'; // Make the error message visible
//     } else {
//       errorMessage.style.display = 'none'; // Hide the error message if the form is valid
//     }
//   });
// });
// service checkbox validation not working
// mobile number in contact form validation partially working
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('serviceform');

  form.addEventListener('submit', function(event) {
    const checkboxes = form.querySelectorAll('input[type="checkbox"][name="service"]');
    const atLeastOneChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

    if (!atLeastOneChecked) {
      event.preventDefault(); // Stop form submission
      alert('Please select at least one service before submitting the form.');
    }
  });
});
//erase service form on close or successfull submit
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("serviceform");
  const modalEl = document.getElementById("exampleModal");

  if (!form || !modalEl) return;

  // Reset form when modal is closed
  modalEl.addEventListener('hidden.bs.modal', function () {
    form.reset();
  });

  // Handle form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent default behavior

    const formData = new FormData(form);

    fetch(form.action, {
      method: form.method,
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        form.reset();

        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        alert("Your request has been submitted successfully!");
      } else {
        alert("Something went wrong. Please try again.");
      }
    }).catch(error => {
      console.error("Form error:", error);
      alert("There was a problem submitting the form.");
    });
  });
});
//erase contact form after successsful submission
document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");

  if (!contactForm) return;

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent default form action

    const formData = new FormData(contactForm);

    fetch(contactForm.action, {
      method: contactForm.method,
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        contactForm.reset();
        alert("Your message has been submitted successfully!");
      } else {
        alert("Submission failed. Please try again.");
      }
    }).catch(error => {
      console.error("Form error:", error);
      alert("There was a problem submitting the form.");
    });
  });
});
//validate contact form
document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");
  const emailInput = document.getElementById("email");
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const mobileInput = document.getElementById("mobile");

  const emailError = document.getElementById("emailError");
  const firstnameError = document.getElementById("firstnameError");
  const lastnameError = document.getElementById("lastnameError");
  const mobileError = document.getElementById("mobileError");

  if (
    !contactForm ||
    !emailInput ||
    !firstNameInput ||
    !lastNameInput ||
    !mobileInput ||
    !emailError ||
    !firstnameError ||
    !lastnameError ||
    !mobileError
  ) return;

  // Email validation
  emailInput.addEventListener("input", function () {
    const email = emailInput.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    emailError.textContent = !emailRegex.test(email)
      ? "Please enter a valid email address."
      : "";
  });

  // First Name validation
  firstNameInput.addEventListener("input", function () {
    const firstName = firstNameInput.value;
    const nameRegex = /^[A-Za-z\s]+$/;
    firstnameError.textContent = !nameRegex.test(firstName)
      ? "First name can only contain letters and spaces."
      : "";
  });

  // Last Name validation
  lastNameInput.addEventListener("input", function () {
    const lastName = lastNameInput.value;
    const nameRegex = /^[A-Za-z\s]+$/;
    lastnameError.textContent = !nameRegex.test(lastName)
      ? "Last name can only contain letters and spaces."
      : "";
  });

  
//   // Mobile validation (restrict to digits only + validate 10-digit Indian format)
// mobileInput.addEventListener("input", function (e) {
//   // Allow only digits and update the input value with only digits
//   mobileInput.value = mobileInput.value.replace(/\D/g, '');

//   const mobile = mobileInput.value;
//   const mobileRegex = /^[6-9][0-9]{9}$/;

//   // Handle the validation feedback
//   if (mobile.length === 0) {
//     mobileError.textContent = "";
//   } else if (mobile.length < 10) {
//     mobileError.textContent = "Mobile number must be exactly 10 digits.";
//   } else if (!mobileRegex.test(mobile)) {
//     mobileError.textContent = "Mobile number must start with digits 6-9.";
//   } else {
//     mobileError.textContent = "";
//   }
// });

// Block non-digits during typing and pasting
mobileInput.addEventListener("beforeinput", function (e) {
  const inputChar = e.data;

  // If inputChar is null (like when deleting), skip validation
  if (inputChar && /\D/.test(inputChar)) {
    e.preventDefault();
  }
});

// Also handle paste event
mobileInput.addEventListener("paste", function (e) {
  const pastedData = (e.clipboardData || window.clipboardData).getData("text");
  if (/\D/.test(pastedData)) {
    e.preventDefault();
  }
});

// Validate after input
mobileInput.addEventListener("input", function () {
  mobileInput.value = mobileInput.value.replace(/\D/g, ''); // clean-up just in case

  const mobile = mobileInput.value;
  const mobileRegex = /^[6-9][0-9]{9}$/;

  if (mobile.length === 0) {
    mobileError.textContent = "";
  } else if (mobile.length < 10) {
    mobileError.textContent = "Mobile number must be exactly 10 digits.";
  } else if (!mobileRegex.test(mobile)) {
    mobileError.textContent = "Mobile number must start with digits 6-9.";
  } else {
    mobileError.textContent = "";
  }
});

  // Submit handler
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (
      !emailError.textContent &&
      !firstnameError.textContent &&
      !lastnameError.textContent &&
      !mobileError.textContent
    ) {
      const formData = new FormData(contactForm);
      fetch(contactForm.action, {
        method: contactForm.method,
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
        .then(response => {
          if (response.ok) {
            contactForm.reset();
            alert("Your message has been submitted successfully!");
          } else {
            alert("Submission failed. Please try again.");
          }
        })
        .catch(error => {
          console.error("Form submission error:", error);
          alert("There was a problem submitting the form.");
        });
    }
  });
});

function closenav() {
  document.querySelector(".nav-bar").classList.remove("active");
}

document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("name");

  nameInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });
});