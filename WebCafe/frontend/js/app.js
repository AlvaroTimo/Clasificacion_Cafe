document.addEventListener("DOMContentLoaded", function() {
    let data = [];
    const SIZE_POINT = 3;
    const SIZE_POINT_SELECTED = 8;
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff7f50', '#6495ed', '#333330', '#00a080', '#bdb76b', '#7f7f7f', '#ff1493'];
    let selectedIndex = null;  

    function generate_points(data_response, projection) {
        data = [];
        let clases = data_response["Nombres de las clases"];

        const minX = d3.min(data_response[projection], d => d[0]);
        const minY = d3.min(data_response[projection], d => d[1]);

        const maxX = d3.max(data_response[projection], d => d[0]);
        const maxY = d3.max(data_response[projection], d => d[1]);

        const x = d3.scaleLinear()
                .domain([minX, maxX])
                .range([0, 100]);

        const y = d3.scaleLinear()
                    .domain([minY, maxY])
                    .range([0, 100]);

        for (let i = 0; i < data_response["Etiquetas reales"].length; i++) {
            let color = 0;
            if (data_response["Etiquetas predichas"][i] === data_response["Etiquetas reales"][i]) {
                color = data_response["Etiquetas predichas"][i];
            } else {
                color = data_response["Etiquetas reales"][i];
            }

            const xPos = x(data_response[projection][i][0]);
            const yPos = y(data_response[projection][i][1]);

            data.push({ 
                x: xPos, 
                y: yPos, 
                className: color, 
                src: "images/" + data_response["Nombres de los archivos"][i],
                trueLabel: data_response["Etiquetas reales"][i],
                predictLabel: data_response["Etiquetas predichas"][i],
                fileName: data_response["Nombres de los archivos"][i]
            });
        }
    }

    function getColor(index) {
        return colors[index % colors.length];
    }

    const div = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

    function plotearPuntos(selectedClassificationModel, selectedProjectionTechnique) {
        d3.json(`http://localhost:3000/predicciones/${selectedClassificationModel}`)
        .then(parsedData => {
            generate_points(parsedData, `Coordenadas ${selectedProjectionTechnique}`);
            
            const canvas = d3.select(".canva");
            canvas.selectAll("svg").remove();

            const svg = canvas.append("svg")
                    .attr("width", "100%")
                    .attr("height", "100%");

            const points = svg.selectAll("circle")
                .data(data);

            points.enter().append("circle")
                .attr("cx", (d) => d.x + '%')
                .attr("cy", (d) => d.y + '%')
                .attr("r", (d, i) => i === selectedIndex ? SIZE_POINT_SELECTED : SIZE_POINT)
                .attr("fill", (d) => getColor(d.className))
                .on("mouseover", function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .style('opacity', 0.3);

                    div.transition()
                        .duration(100)
                        .style("opacity", 0.9);

                    const clases = parsedData["Nombres de las clases"];
                    const nodes = d3.select(this.parentNode).selectAll(this.tagName).nodes();
                    const index = nodes.indexOf(this);

                    div.html(`<div style="text-align: center;">
                                <img id="tooltip-image" src=${d.src} alt="Imagen del grano de cafe" style="width: 100px; height: 100px;">
                                <p> Clase real: ${clases[d.trueLabel]} </p>
                                <p> Clase predicha: ${clases[d.predictLabel]} </p>
                                <button id="explain-button">Explicar</button>
                              </div>` ) 
                            .style("left", (event.pageX + 3) + "px")
                            .style("top", (event.pageY + 3) + "px");

                    document.getElementById("explain-button").addEventListener("click", function() {
                        const newSrc = `images/gradCAM/${window.selectedClassificationModel}/${d.fileName}`;
                        document.getElementById("tooltip-image").src = newSrc;
                    });
                })
                .on("mouseout", function () {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .style('opacity', 1);
                })
                .on("click", function (event, d) {
                    const nodes = d3.select(this.parentNode).selectAll(this.tagName).nodes();
                    const index = nodes.indexOf(this);
                    selectedIndex = index;
                    plotearPuntos(window.selectedClassificationModel, window.selectedProjectionTechnique);
                });

            //points.exit().remove();
        })
        .catch(err => {
            console.error(err);
        });
    }

    window.selectedProjectionTechnique = "UMAP";
    window.selectedClassificationModel = "ResNet50";

    const dropdownOptionsModel = document.querySelectorAll(".dropdown-option-model");
    const dropdownOptionsProjection = document.querySelectorAll(".dropdown-option");

    dropdownOptionsModel.forEach(function(option) {
        option.addEventListener("click", function(event) {
            event.preventDefault();
            const selectedValue = option.getAttribute("data-value");
            console.log("Modelo de Clasificación seleccionado:", selectedValue);

            window.selectedClassificationModel = selectedValue;
            plotearPuntos(window.selectedClassificationModel, window.selectedProjectionTechnique);
            div.transition()
                .duration(3000)
                .style("opacity",0)
        });
    });

    dropdownOptionsProjection.forEach(function(option) {
        option.addEventListener("click", function(event) {
            event.preventDefault();
            const selectedValue = option.getAttribute("data-value");
            console.log("Técnica de Proyección seleccionada:", selectedValue);

            window.selectedProjectionTechnique = selectedValue;
            plotearPuntos(window.selectedClassificationModel, window.selectedProjectionTechnique);
            div.transition()
                .duration(100)
                .style("opacity",0)
        });
    });

    plotearPuntos(window.selectedClassificationModel, window.selectedProjectionTechnique);
});
