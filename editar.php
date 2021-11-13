<?php
    include 'inc/funciones/funciones.php';
    include 'inc/layout/header.php'; 
//trayendo valores desde la base de datos con el id
    $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);

    if(!$id){
        die('no es valido');
    };

    $resultado = obtenerContacto($id);
    $contacto = $resultado->fetch_assoc();
    
?>

<div class="contenedor-barra">
    <div class="contenedor barra">
        <a href="index.php" class="btn volver">Volver</a>
        <h1>Editar Contacto</h1>
    </div>
</div>

<div class="contenedor bg-amarillo sombra">
    <form action="#" id="contacto">
        <legend>Edite el Contacto <span>Todos los campos son obligatorios</span></legend>

        <?php include 'inc/layout/formulario.php'; ?>
    </form>
</div>



<?php
    include 'inc/layout/footer.php'; 
?>