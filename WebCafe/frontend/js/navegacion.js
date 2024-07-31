document.addEventListener("DOMContentLoaded", function() {
    var dropdownOptionsModel = document.querySelectorAll(".dropdown-option-model");
    var dropdownOptionsProjection = document.querySelectorAll(".dropdown-option");

    dropdownOptionsModel.forEach(function(option) {
        option.addEventListener("click", function(event) {
            event.preventDefault();
            var selectedValue = option.getAttribute("data-value");
            console.log("Modelo de Clasificación seleccionado:", selectedValue);

            // Establece la variable para el modelo de clasificación
            window.selectedclassificationModel = selectedValue;
        });
    });

    dropdownOptionsProjection.forEach(function(option) {
        option.addEventListener("click", function(event) {
            event.preventDefault();
            var selectedValue = option.getAttribute("data-value");
            console.log("Técnica de Proyección seleccionada:", selectedValue);

            // Establece la variable para la técnica de proyección
            window.selectedProjectionTechnique = selectedValue;
        });
    });
});
