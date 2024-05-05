// Cette section sert de commentaire en commentaire de style JSDoc indiquant les informations sur le script.

// Cette ligne démarre une fonction anonyme immédiatement invoquée (IIFE).
(function () {
  "use strict"; // Mode strict pour des pratiques de codage plus sûres.

  // Sélectionne tous les éléments du DOM avec la classe 'php-email-form' et les stocke dans la variable 'forms'.
  let forms = document.querySelectorAll('.php-email-form');

  // Itère sur chaque formulaire sélectionné.
  forms.forEach(function (e) {

    // Ajoute un écouteur d'événement pour l'événement de soumission du formulaire.
    e.addEventListener('submit', function (event) {
      event.preventDefault(); // Empêche le comportement par défaut du formulaire.

      let thisForm = this; // Stocke une référence au formulaire actuel.

      // Récupère l'attribut 'action' du formulaire.
      let action = thisForm.getAttribute('action');

      // Récupère l'attribut 'data-recaptcha-site-key' du formulaire.
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');

      // Vérifie si l'attribut 'action' est défini.
      if (!action) {
        displayError(thisForm, 'The form action property is not set!')
        return;
      }

      // Affiche l'élément de chargement du formulaire.
      thisForm.querySelector('.loading').classList.add('d-block');
      // Cache les messages d'erreur et de succès du formulaire.
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      // Crée un objet FormData à partir du formulaire.
      let formData = new FormData(thisForm);

      // Vérifie si reCAPTCHA est activé pour le formulaire.
      if (recaptcha) {
        // Vérifie si l'objet grecaptcha est défini.
        if (typeof grecaptcha !== "undefined") {
          // Utilise la fonction ready pour exécuter le code lorsque reCAPTCHA est prêt.
          grecaptcha.ready(function () {
            try {
              // Exécute reCAPTCHA et récupère le token.
              grecaptcha.execute(recaptcha, { action: 'php_email_form_submit' })
                .then(token => {
                  // Ajoute le token reCAPTCHA à l'objet FormData.
                  formData.set('recaptcha-response', token);
                  // Appelle la fonction pour soumettre le formulaire.
                  php_email_form_submit(thisForm, action, formData);
                })
            } catch (error) {
              // Affiche une erreur si quelque chose ne va pas avec reCAPTCHA.
              displayError(thisForm, error)
            }
          });
        } else {
          // Affiche une erreur si l'API JavaScript reCAPTCHA n'est pas chargée.
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        // Soumet le formulaire sans reCAPTCHA.
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  // Fonction qui soumet le formulaire via une requête Fetch.
  function php_email_form_submit(thisForm, action, formData) {
    fetch(action, {
      method: 'POST', // Utilise la méthode POST pour envoyer les données.
      body: formData, // Utilise l'objet FormData comme corps de la requête.
      headers: { 'X-Requested-With': 'XMLHttpRequest' } // Ajoute un en-tête indiquant une requête AJAX.
    })
      .then(response => {
        // Vérifie si la réponse est OK (statut HTTP 200).
        if (response.ok) {
          return response.text(); // Renvoie le contenu de la réponse en tant que texte.
        } else {
          // Lance une erreur si la réponse n'est pas OK.
          throw new Error(`${response.status} ${response.statusText} ${response.url}`);
        }
      })
      .then(data => {
        // Cache l'élément de chargement du formulaire.
        thisForm.querySelector('.loading').classList.remove('d-block');
        // Vérifie si la réponse du serveur est 'OK'.
        if (data.trim() == 'OK') {
          // Affiche le message de succès et réinitialise le formulaire.
          thisForm.querySelector('.sent-message').classList.add('d-block');
          thisForm.reset();
        } else {
          // Lance une erreur si la réponse du serveur n'est pas 'OK'.
          throw new Error(data ? data : 'Form submission failed and no error message returned from: ' + action);
        }
      })
      .catch((error) => {
        // Affiche une erreur en cas d'échec de la requête Fetch.
        displayError(thisForm, error);
      });
  }

  // Fonction qui affiche les erreurs dans le formulaire.
  function displayError(thisForm, error) {
    // Cache l'élément de chargement du formulaire.
    thisForm.querySelector('.loading').classList.remove('d-block');
    // Affiche le message d'erreur dans le formulaire.
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
