import router from '../router.js';

export default {
  name: 'Footer',
  template: `
    <footer class="main-footer mt-auto">
      <div class="container-fluid px-3 px-lg-4 py-3">
        <div class="row align-items-center gy-3">
          <div class="col-12 col-md-4 text-center text-md-start">
            <a class="footer-brand" href="/" aria-label="Ir al inicio" @click.prevent="router.push('/')">IndiAR</a>
          </div>
          <nav class="col-12 col-md-4" aria-label="Enlaces del pie de página">
            <ul class="footer-links justify-content-center">
              <li><a href="#">Compañía</a></li>
              <li><a href="#">Ayuda</a></li>
              <li><a href="#">Términos</a></li>
              <li><a href="#">Privacidad</a></li>
            </ul>
          </nav>
          <div class="col-12 col-md-4">
            <ul class="footer-social justify-content-center justify-content-md-end">
              <li><a href="#" aria-label="YouTube"><i class="fa-brands fa-square-youtube"></i></a></li>
              <li><a href="#" aria-label="Facebook"><i class="fa-brands fa-square-facebook"></i></a></li>
              <li><a href="#" aria-label="X"><i class="fa-brands fa-square-x-twitter"></i></a></li>
              <li><a href="#" aria-label="Steam"><i class="fa-brands fa-steam"></i></a></li>
            </ul>
          </div>
        </div>
        <p class="footer-copy mb-0 mt-3 text-center">© {{ currentYear }} IndiAR. Todos los derechos reservados.</p>
      </div>
    </footer>
  `,
  setup() {
    return { router, currentYear: new Date().getFullYear() };
  }
};
