const validateInput = (type, value) => {
  if (!value) {
    return `${type.charAt(0).toUpperCase() + type.slice(1)} is required`;
  } else {
    if (type === "email") {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(value)) {
        return "invalid email address";
      } else {
        return null;
      }
    }
  }
};

const validateFile = (file) => {
  const types = ["jpg", "png", "jpeg"];
  const extension = file?.name.split(".").pop().toLowerCase();
  const isValid = types.some((type) => type === extension);

  if (isValid) {
    return true;
  } else {
    alert("upload jpg, png or jpeg file");
    return false;
  }
};

export { validateInput, validateFile };
