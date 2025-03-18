document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const video = document.getElementById('forest-video');
    const soundSlider = document.getElementById('sound-slider');
    const soundControl = document.querySelector('.sound-control');
    const quotes = document.querySelectorAll('.quote');
    
    // Créer l'écran de démarrage noir avec texte
    const startScreen = document.createElement('div');
    startScreen.className = 'start-screen';
    startScreen.innerHTML = '<div class="start-text">Cliquez pour commencer l\'expérience</div>';
    document.body.appendChild(startScreen);
    
    // Masquer initialement la vidéo et le contrôle du son
    video.style.opacity = 0;
    soundControl.style.opacity = 0;
    
    // ===== Gestion du son =====
    
    // Vérifier et charger le niveau de volume précédent, par défaut à 100 (100%)
    const savedVolume = localStorage.getItem('volume') !== null 
        ? parseInt(localStorage.getItem('volume')) 
        : 100;
    
    // Définir la valeur initiale du slider
    soundSlider.value = savedVolume;
    
    // Fonction pour appliquer correctement le volume à la vidéo
    function applyVolumeSettings() {
        const volumeValue = parseInt(soundSlider.value);
        
        // Si le volume est 0, la vidéo reste en muet
        if (volumeValue === 0) {
            video.muted = true;
            video.volume = 0;
        } else {
            // Sinon, désactiver le mode muet et appliquer le volume
            video.volume = volumeValue / 100;
            video.muted = false;
        }
    }
    
    // Gérer le clic sur l'écran de démarrage
    startScreen.addEventListener('click', function() {
        // Démarrer la lecture de la vidéo uniquement après l'interaction de l'utilisateur
        const playPromise = video.play();
        
        // Attendre que la promesse soit résolue avant d'appliquer les paramètres audio
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // Appliquer les paramètres de volume après la résolution de la promesse
                setTimeout(applyVolumeSettings, 100);
            })
            .catch(error => {
                console.log("Erreur lors du démarrage de la vidéo:", error);
            });
        }
        
        // Animation de fondu pour le texte - ralentie à 1.5s
        const startText = document.querySelector('.start-text');
        startText.style.opacity = 0;
        startText.style.transition = 'opacity 1.5s ease'; // Transition plus lente pour le texte
        
        // Faire apparaître la vidéo plus lentement après le clic
        setTimeout(() => {
            startScreen.style.opacity = 0;
            startScreen.style.transition = 'opacity 4s ease'; // Transition de 4s pour l'écran noir
            
            video.style.opacity = 1;
            video.style.transition = 'opacity 4s ease'; // Transition de 4s pour la vidéo
            
            soundControl.style.opacity = 1;
            soundControl.style.transition = 'opacity 4s ease'; // Transition de 4s pour le contrôle du son
            
            // Ajouter un petit délai supplémentaire pour s'assurer que les paramètres audio sont appliqués
            setTimeout(applyVolumeSettings, 200);
            
            // Ajouter la flèche de défilement (qui reste visible)
            const scrollArrow = document.createElement('div');
            scrollArrow.className = 'scroll-arrow';
            scrollArrow.innerHTML = `
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4V20M12 20L6 14M12 20L18 14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            document.body.appendChild(scrollArrow);
            
            // Faire apparaître la flèche progressivement
            setTimeout(() => {
                scrollArrow.style.opacity = 1;
                scrollArrow.style.transition = 'opacity 2s ease'; // Transition plus lente pour la flèche
            }, 1000); // Délai augmenté à 1s
            
            // Supprimer l'écran de démarrage une fois l'animation terminée
            setTimeout(() => {
                document.body.removeChild(startScreen);
            }, 3500); // Délai augmenté à 3.5s pour correspondre à la transition plus lente
        }, 1000); // Délai augmenté à 1s
    });
    
    // ===== Gestion de la vidéo =====
    
    // Reprendre la vidéo là où elle s'était arrêtée
    const savedTime = localStorage.getItem('videoTime');
    if (savedTime) {
        video.currentTime = parseFloat(savedTime);
    }
    
    // Enregistrer la position de la vidéo avant de quitter la page
    window.addEventListener('beforeunload', function() {
        localStorage.setItem('videoTime', video.currentTime);
    });
    
    // Variables pour l'animation de pulsation
    let pulsePhase = 0;
    const pulseSpeed = 0.03; // Vitesse de l'animation (plus petit = plus lent)
    
    // Fonction pour animer les pulsations des bordures
    function animatePulseBorders() {
        pulsePhase += pulseSpeed;
        if (pulsePhase > Math.PI * 2) {
            pulsePhase = 0; // Réinitialiser quand on atteint un cycle complet
        }
        
        // Valeur sinusoïdale entre 0 et 1 pour l'animation
        const pulseFactor = (Math.sin(pulsePhase) + 1) / 2;
        
        // Appliquer l'animation à toutes les citations visibles
        quotes.forEach(quote => {
            if (quote.classList.contains('visible')) {
                // Récupérer l'opacité actuelle comme indicateur de visibilité
                const opacity = parseFloat(quote.style.opacity || 0);
                
                if (opacity >= 0.1) {
                    // Calculer l'amplitude de pulsation proportionnelle à la visibilité
                    // La pulsation minimale est de 2px, la maximale de 10px
                    const pulseAmplitude = 4 + (opacity * 20);
                    
                    // Calculer l'opacité de la bordure proportionnelle à la visibilité
                    // L'opacité minimale est de 0.1, la maximale de 0.4
                    const borderOpacity = 0.1 + (opacity * 0.3);
                    
                    // Position de base de la bordure (10px)
                    const baseDistance = 1;
                    
                    // Calcul de la distance actuelle en fonction de la pulsation
                    const currentDistance = baseDistance + (pulseFactor * pulseAmplitude);
                    
                    // Calculer l'opacité actuelle en fonction de la pulsation
                    // Plus la bordure s'éloigne, plus elle devient transparente
                    const currentOpacity = borderOpacity * (1 - (pulseFactor * 0.25));
                    
                    // Appliquer la box-shadow avec les valeurs calculées
                    quote.style.boxShadow = `0 0 0 ${currentDistance}px rgba(255, 255, 255, ${currentOpacity})`;
                } else {
                    // En dessous de 10%, pas de seconde bordure
                    quote.style.boxShadow = 'none';
                }
            }
        });
        
        // Continuer l'animation
        requestAnimationFrame(animatePulseBorders);
    }
    
    // Démarrer l'animation
    requestAnimationFrame(animatePulseBorders);
    
    // ===== Gestion des citations strictement liées au défilement =====
    
    // Hauteur totale de défilement
    const documentHeight = document.body.scrollHeight - window.innerHeight;
    
    // Augmenter encore plus l'espace de défilement (4 fois plus grand)
    document.body.style.height = (documentHeight * 4) + "px";
    
    // Recalculer la hauteur totale après avoir modifié la hauteur du document
    const newDocumentHeight = document.body.scrollHeight - window.innerHeight;
    
    // Diviser la nouvelle hauteur en sections pour chaque citation
    const totalSections = quotes.length;
    const sectionHeight = newDocumentHeight / totalSections;
    
    // Observer le défilement et afficher/masquer les citations en fonction de la position exacte
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        quotes.forEach((quote, index) => {
            // Calculer les limites de chaque section avec beaucoup plus d'espace entre elles
            const sectionStart = index * sectionHeight;
            const fadeInStart = sectionStart;
            // Modification ici : augmenter la zone d'apparition à 80% de la section
            const fullyVisibleStart = sectionStart + (sectionHeight * 0.6); // Visible après 80% de la section (au lieu de 60%)
            const fadeOutStart = sectionStart + (sectionHeight * 0.7); // Commencer à disparaître après 90% de la section (au lieu de 80%)
            const sectionEnd = sectionStart + sectionHeight;
            
            // Vérifier si l'utilisateur se trouve dans la zone d'influence de cette citation
            if (scrollPosition >= fadeInStart && scrollPosition < sectionEnd) {
                quote.classList.add('visible');
                
                // Phase d'apparition progressive (beaucoup plus lente)
                if (scrollPosition >= fadeInStart && scrollPosition < fullyVisibleStart) {
                    // Transition d'entrée très lente (0 à 1 sur 80% de la section)
                    const progress = (scrollPosition - fadeInStart) / (fullyVisibleStart - fadeInStart);
                    
                    // Utilisation d'une fonction de puissance pour ralentir l'apparition au début
                    const easedProgress = Math.pow(progress, 1.5);
                    
                    quote.style.opacity = easedProgress;
                    
                    // Intensification progressive de l'ombre du texte
                    const shadowIntensity = easedProgress;
                    quote.querySelector('p').style.textShadow = `0 0 ${shadowIntensity * 10}px rgba(0, 0, 0, ${shadowIntensity})`;
                    
                    // Animation progressive du cadre blanc
                    quote.style.borderColor = `rgba(255, 255, 255, ${easedProgress * 0.7})`; // Opacité max de 0.7 pour le cadre
                    quote.style.backgroundColor = `rgba(0, 0, 0, ${easedProgress * 0.2})`; // Fond légèrement noir pour améliorer la lisibilité
                    
                    // La pulsation est maintenant gérée par la fonction animatePulseBorders
                } 
                // Phase de visibilité complète
                else if (scrollPosition >= fullyVisibleStart && scrollPosition < fadeOutStart) {
                    // Maintenir pleinement visible pendant 10% de la section
                    quote.style.opacity = 1;
                    quote.querySelector('p').style.textShadow = '0 0 10px rgba(0, 0, 0, 1)';
                    quote.style.borderColor = 'rgba(255, 255, 255, 0.7)'; // Cadre blanc à pleine opacité (0.7)
                    quote.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; // Fond légèrement noir pour améliorer la lisibilité
                    
                    // La pulsation est maintenant gérée par la fonction animatePulseBorders
                } 
                // Phase de disparition progressive
                else {
                    // Transition de sortie (1 à 0 sur 10% de la section)
                    const progress = 1 - ((scrollPosition - fadeOutStart) / (sectionEnd - fadeOutStart));
                    
                    // Appliquer la même courbe pour la disparition
                    const easedProgress = Math.pow(progress, 1.5);
                    
                    quote.style.opacity = easedProgress;
                    
                    // Maintenir l'ombre proportionnellement
                    quote.querySelector('p').style.textShadow = `0 0 10px rgba(0, 0, 0, ${easedProgress})`;
                    
                    // Disparition progressive du cadre
                    quote.style.borderColor = `rgba(255, 255, 255, ${easedProgress * 0.7})`;
                    quote.style.backgroundColor = `rgba(0, 0, 0, ${easedProgress * 0.2})`;
                    
                    // La pulsation est maintenant gérée par la fonction animatePulseBorders
                }
            } else {
                // Si la citation est hors de la zone visible
                quote.style.opacity = 0;
                quote.classList.remove('visible');
                quote.style.borderColor = 'rgba(255, 255, 255, 0)'; // Cadre invisible
                quote.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // Fond transparent
                quote.style.boxShadow = 'none'; // Pas de seconde bordure
            }
        });
    });
    
    // Appeler l'événement de défilement au chargement pour initialiser l'état
    window.dispatchEvent(new Event('scroll'));
    
    // Observer le défilement pour faire disparaître la flèche en bas de page
    window.addEventListener('scroll', function() {
        const scrollArrow = document.querySelector('.scroll-arrow');
        if (scrollArrow) {
            const scrollPosition = window.scrollY;
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            
            // Si l'utilisateur est proche du bas de la page (à 90% du défilement total)
            if (scrollPosition > maxScroll * 0.9) {
                scrollArrow.style.opacity = 0;
            } else {
                scrollArrow.style.opacity = 1;
            }
        }
    });
    
    // Activer/désactiver le son lorsque le slider est déplacé
    soundSlider.addEventListener('input', function() {
        applyVolumeSettings();
        
        // Sauvegarder le niveau de volume
        localStorage.setItem('volume', soundSlider.value);
    });
    
    // Ajouter un gestionnaire d'événement de clic sur la page pour s'assurer que les paramètres
    // de volume sont appliqués après toute interaction de l'utilisateur
    document.addEventListener('click', function() {
        // Délai court pour laisser le navigateur traiter d'abord l'événement de clic
        setTimeout(applyVolumeSettings, 100);
    }, { once: false });
}); 