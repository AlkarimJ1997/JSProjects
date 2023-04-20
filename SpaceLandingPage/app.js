// Navbar selectors
const menu = document.querySelector("#mobile-menu");
const menuLinks = document.querySelector(".nav-menu");

// Modal selectors
const modal = document.getElementById("email-modal");
const openBtn = document.querySelector(".main-btn");
const closeBtn = document.querySelector(".close-btn");

// Form validation selectors
const form = document.getElementById("form");
const name = document.getElementById("name");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("password-confirm");

// Image gallery variables
let galleryImages = document.querySelectorAll(".services-cell");
let imageIndex;

// Show error messages
const showError = (input, message) => {
    // Get the parent of the input field 
    const formValidation = input.parentElement;

    // Add the error class to the input group
    formValidation.className = "form-validation error";

    // Get reference to the error message element and set the error message
    const errorMessage = formValidation.querySelector("p");
    errorMessage.innerText = message;

}

// Show valid messages
const showValid = input => {
    // Get the parent of the input field 
    const formValidation = input.parentElement;

    // Add the valid class to the input group
    formValidation.className = "form-validation valid";
}

// Helper method to get the field name of the input
const getFieldName = input => {
    return input.name.charAt(0).toUpperCase() + input.name.slice(1);
}

// Helper method to check if the given inputs are valid (non-empty)
const checkRequired = requiredInputs => {
    requiredInputs.forEach(input => {
        if (input.value.trim() === "") {
            showError(input, `${getFieldName(input)} is required`);
        } else {
            showValid(input);
        }
    });
}

// Helper method to check the length of the given input
const checkLength = (input, min, max) => {
    // Check if input is too short
    if (input.value.length < min) {
        showError(input, `${getFieldName(input)} must be at least ${min} characters`);
        return;
    }

    // Check if input is too long
    if (input.value.length > max) {
        showError(input, `${getFieldName(input)} must be less than ${max} characters`);
        return;
    }

    showValid(input);
}

// Helper method to check if the given input is a valid email
const checkEmail = input => {
    // Check if input is a valid email
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!regex.test(input.value.trim())) {
        showError(input, `${getFieldName(input)} must be a valid email`);
        return;
    }

    showValid(input);
}

// Helper method to check if the two passwords match
const checkPasswordMatch = (password, confirmPassword) => {
    if (password.value !== confirmPassword.value) {
        showError(confirmPassword, "Passwords do not match");
    }
}

// Helper method to close the image gallery (remove its elements from the DOM)
const closeImage = () => {
    document.querySelector(".img-window").remove();
    document.querySelector(".img-btn-next").remove();
    document.querySelector(".img-btn-prev").remove();
}

// Helper method to change the image in the image gallery
const changeImage = change => {
    document.querySelector("#current-img").remove();

    // Get reference to the image gallery
    const imageGallery = document.querySelector(".img-window");

    // Create a new image to be displayed
    const newImg = document.createElement("img");

    let newImgIndex;

    // Next button was clicked
    if (change === 1) {
        newImgIndex = imageIndex + 1;

        // If the current image was the last one, go back to the first one
        if (newImgIndex > galleryImages.length) newImgIndex = 1;
    } else if (change === 0) {
        // Previous button was clicked
        newImgIndex = imageIndex - 1;

        // If the current image was the first one, go to the last one
        if (newImgIndex < 1) newImgIndex = galleryImages.length;
    }

    // Set the image source of the new image
    newImg.src = `./images/img-${newImgIndex}.jpg`;

    // Add the "popup-img" class to the new image
    newImg.className = "popup-img";

    // Add an ID to the new image to reference the current image
    newImg.id = "current-img";

    // Set the global image index to the new image index
    imageIndex = newImgIndex;

    // Add the new image to the image gallery
    imageGallery.appendChild(newImg);
}

// Method to setup the image gallery
const setupImageGallery = () => {
    galleryImages.forEach((image, index) => {
        // Open the image gallery when an image is clicked
        image.onclick = () => {
            imageIndex = index + 1;

            // Add an element to the body to display the image gallery
            const imageGallery = document.createElement("div");

            // Add the class and a click event to close the image gallery
            imageGallery.className = "img-window";
            imageGallery.onclick = closeImage;

            // Clone the octagon image
            const newImg = image.firstElementChild.cloneNode();

            // Remove the services-cell_img class from the image and add the "popup-img" class
            newImg.classList.remove("services-cell_img");
            newImg.classList.add("popup-img");

            // Add an ID to the new, cloned image to reference the current image
            newImg.id = "current-img";

            // Add left and right arrows to the image once it's loaded
            newImg.onload = () => {
                const nextBtn = document.createElement("a");
                const prevBtn = document.createElement("a");

                // Add a class to the next button and previous button
                nextBtn.className = "img-btn-next";
                prevBtn.className = "img-btn-prev";

                // Add fontawesome icon to the next button and previous button
                nextBtn.innerHTML = `<i class="fas fa-chevron-right next"></i>`;
                prevBtn.innerHTML = `<i class="fas fa-chevron-left prev"></i>`;

                // Add an onclick event to the next button and previous button to change the image
                nextBtn.setAttribute("onclick", "changeImage(1)");
                prevBtn.setAttribute("onclick", "changeImage(0)");

                // Append the next button and previous button to the body
                document.body.appendChild(nextBtn);
                document.body.appendChild(prevBtn);
            }

            // Append the new, cloned image to the image gallery
            imageGallery.appendChild(newImg);

            // Append the image gallery to the body
            document.body.appendChild(imageGallery);
        }
    })
}

// Event listeners
menu.addEventListener("click", () => {
    // Toggle the mobile menu to be active
    menu.classList.toggle("is-active");
    menuLinks.classList.toggle("active");
});

openBtn.addEventListener("click", () => {
    modal.style.display = "block";
})

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
})

form.addEventListener("submit", e => {
    // Don't submit the form
    e.preventDefault();

    // Check that required input fields are not empty
    checkRequired([name, email, password, confirmPassword]);

    // Check if the length of the input is valid
    checkLength(name, 3, 30);
    checkLength(password, 8, 25);
    checkLength(confirmPassword, 8, 25);

    // Check if the entered email is a valid email
    checkEmail(email);

    // Check if the two passwords match
    checkPasswordMatch(password, confirmPassword);
})

// Close the modal when the user clicks outside of it
addEventListener("click", e => {
    if (e.target === modal) modal.style.display = "none";
})

// Initialize the image gallery
setupImageGallery();