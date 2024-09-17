// Get all module and submodule titles
const moduleTitles = document.querySelectorAll(".module-title");
const submoduleTitles = document.querySelectorAll(".submodule-title");

// Add click event listener to each module title
moduleTitles.forEach((title) => {
  title.addEventListener("click", () => {
    const module = title.parentElement;
    const dropdownContent = module.querySelector(".dropdown-content");

    // Toggle active class for the module
    module.classList.toggle("active");

    // Collapse all submodules when collapsing the main module
    if (!module.classList.contains("active")) {
      const submoduleContents = module.querySelectorAll(".submodule-content");
      submoduleContents.forEach((subContent) => {
        subContent.style.maxHeight = null;
      });
    }

    // Toggle the maxHeight of the dropdown content
    if (dropdownContent.style.maxHeight) {
      dropdownContent.style.maxHeight = null;
    } else {
      dropdownContent.style.maxHeight = dropdownContent.scrollHeight + "px";
    }
  });
});

// Add click event listener to each submodule title
submoduleTitles.forEach((subTitle) => {
  subTitle.addEventListener("click", () => {
    const submoduleContent = subTitle.nextElementSibling;
    const moduleDropdownContent = subTitle.closest(".dropdown-content");

    // Toggle max-height for submodule content
    if (submoduleContent.style.maxHeight) {
      submoduleContent.style.maxHeight = null;
    } else {
      submoduleContent.style.maxHeight = submoduleContent.scrollHeight + "px";

      // Adjust the height of the entire module to accommodate the open submodule
      const currentModuleHeight = moduleDropdownContent.scrollHeight;
      moduleDropdownContent.style.maxHeight =
        currentModuleHeight + submoduleContent.scrollHeight + "px";
    }
  });
});

// Open image in modal
function openModal(element) {
  const modal = document.getElementById("imageModal");
  const fullImage = document.getElementById("fullImage");

  fullImage.src = element.src; // Set the modal image to the full image
  modal.style.display = "block";
}

// Close modal
function closeModal() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
}

// Close modal when clicking outside of it
window.onclick = function (event) {
  const modal = document.getElementById("imageModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Customer management logic
document.addEventListener("DOMContentLoaded", function () {
  const customerForm = document.getElementById("customerForm");
  const customerList = document.getElementById("customerList");
  const searchInput = document.getElementById("search");
  const searchResults = document.getElementById("searchResults");
  let isEditing = false;
  let currentCustomerId = null;

  // Load customers from localStorage on page load
  loadCustomers();

  // Handle form submission
  customerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const imageInput = document.getElementById("image");
    const imageFile = imageInput.files[0];

    const reader = new FileReader();
    reader.onload = function (e) {
      const imageData = e.target.result;
      const customer = { name, email, phone, address, image: imageData };
      if (isEditing) {
        updateCustomer(currentCustomerId, customer);
      } else {
        addCustomer(customer);
      }
      resetForm();
    };

    if (imageFile) {
      reader.readAsDataURL(imageFile);
    } else {
      const customer = { name, email, phone, address };
      if (isEditing) {
        updateCustomer(currentCustomerId, customer);
      } else {
        addCustomer(customer);
      }
      resetForm();
    }
  });

  // Handle search input
  searchInput.addEventListener("input", function () {
    const query = searchInput.value.toLowerCase();
    if (query.length > 0) {
      const customers = JSON.parse(localStorage.getItem("customers")) || [];
      const filteredCustomers = customers.filter((customer) => {
        return (
          customer.name.toLowerCase().includes(query) ||
          (customer.email && customer.email.toLowerCase().includes(query)) ||
          (customer.phone && customer.phone.toLowerCase().includes(query)) ||
          (customer.address && customer.address.toLowerCase().includes(query))
        );
      });

      renderSearchResults(filteredCustomers);
    } else {
      searchResults.innerHTML = "";
    }
  });

  function renderSearchResults(customers) {
    searchResults.innerHTML = ""; // Clear previous search results

    customers.forEach((customer, index) => {
      const li = document.createElement("li");
      li.textContent = `${customer.name} - ${customer.email} - ${customer.phone} - ${customer.address}`;
      li.className = "cursor-pointer hover:bg-gray-200 p-2";
      li.addEventListener("click", () => {
        searchInput.value = customer.name;
        searchResults.innerHTML = "";
        editCustomer(index);
      });
      searchResults.appendChild(li);
    });
  }

  function addCustomer(customer) {
    let customers = JSON.parse(localStorage.getItem("customers")) || [];
    customers.push(customer);
    localStorage.setItem("customers", JSON.stringify(customers));
    renderCustomerList();
  }

  function loadCustomers() {
    renderCustomerList();
  }

  function renderCustomerList() {
    customerList.innerHTML = ""; // Clear the list

    const customers = JSON.parse(localStorage.getItem("customers")) || [];

    customers.forEach((customer, index) => {
      const li = document.createElement("li");
      li.className = "bg-gray-100 p-4 mb-2 flex items-center justify-between";

      const img = document.createElement("img");
      img.src = customer.image || "default-avatar.png"; // Если нет изображения, использовать изображение по умолчанию
      img.className = "w-12 h-12 rounded-full mr-4";

      const detailsDiv = document.createElement("div");
      detailsDiv.className = "customer-details flex-1";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = `Name: ${customer.name}`;
      nameSpan.className = "block font-semibold";

      const emailSpan = document.createElement("span");
      emailSpan.textContent = `Email: ${customer.email}`;
      emailSpan.className = "block";

      const phoneSpan = document.createElement("span");
      phoneSpan.textContent = `Phone: ${customer.phone}`;
      phoneSpan.className = "block";

      const addressSpan = document.createElement("span");
      addressSpan.textContent = `Address: ${customer.address}`;
      addressSpan.className = "block";

      detailsDiv.appendChild(nameSpan);
      detailsDiv.appendChild(emailSpan);
      detailsDiv.appendChild(phoneSpan);
      detailsDiv.appendChild(addressSpan);

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "customer-actions flex";

      const editButton = document.createElement("button");
      editButton.className =
        "edit bg-blue-500 text-white px-3 py-1 rounded mr-2";
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => editCustomer(index));

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete bg-red-500 text-white px-3 py-1 rounded";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => deleteCustomer(index));

      actionsDiv.appendChild(editButton);
      actionsDiv.appendChild(deleteButton);

      li.appendChild(img);
      li.appendChild(detailsDiv);
      li.appendChild(actionsDiv);
      customerList.appendChild(li);
    });
  }

  function editCustomer(index) {
    const customers = JSON.parse(localStorage.getItem("customers")) || [];
    const customer = customers[index];

    document.getElementById("customerId").value = index;
    document.getElementById("name").value = customer.name;
    document.getElementById("email").value = customer.email;
    document.getElementById("phone").value = customer.phone;
    document.getElementById("address").value = customer.address;

    isEditing = true;
    currentCustomerId = index;

    document.getElementById("formTitle").textContent = "Edit Customer";
    document.getElementById("submitBtn").textContent = "Update Customer";
  }

  function updateCustomer(index, updatedCustomer) {
    let customers = JSON.parse(localStorage.getItem("customers")) || [];
    customers[index] = updatedCustomer;
    localStorage.setItem("customers", JSON.stringify(customers));
    renderCustomerList();
  }

  function deleteCustomer(index) {
    let customers = JSON.parse(localStorage.getItem("customers")) || [];
    customers.splice(index, 1);
    localStorage.setItem("customers", JSON.stringify(customers));
    renderCustomerList();
  }

  function resetForm() {
    customerForm.reset(); // Clear form after submission
    isEditing = false;
    currentCustomerId = null;
    document.getElementById("formTitle").textContent = "Add New Customer";
    document.getElementById("submitBtn").textContent = "Add Customer";
  }
});
