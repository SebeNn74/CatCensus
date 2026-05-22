import { useState } from "react";
import { personSchema } from "../schemas/person.schema";

const INITIAL_FORM = {
  nombres: "",
  apellidos: "",
  tipoDocumento: "CC",
  documento: "",
  direccion: "",
  telefono: "",
  ciudad: "",
  usuario: "",
  contrasena: "",
};

export function usePersonForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validate = () => {
    const result = personSchema.safeParse(form);
    if (result.success) {
      setErrors({});
      return true;
    }
    const fieldErrors = result.error.flatten().fieldErrors;
    setErrors(fieldErrors);
    return false;
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
  };

  return {
    form,
    errors,
    handleChange,
    validate,
    resetForm,
  };
}
