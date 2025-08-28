
  function redirectJob(jobId) {
    window.location.href = "../job-searchpage/Jobsearch.html";
  }


  function initSlider(sliderSelector) {
    const track = document.querySelector(sliderSelector);
    if(!track) return;
    const cards = Array.from(track.children);
    if(cards.length === 0) return;

    const firstClone = cards[0].cloneNode(true);
    const lastClone = cards[cards.length - 1].cloneNode(true);
    track.appendChild(firstClone);
    track.insertBefore(lastClone, cards[0]);

    let index = 1;
    let cardWidth = cards[0].getBoundingClientRect().width + 20;
    track.style.transform = `translateX(-${cardWidth * index}px)`;

    function moveToIndex() {
      track.style.transition = 'transform 0.4s ease';
      track.style.transform = `translateX(-${cardWidth * index}px)`;
    }

    setInterval(() => {
      index++;
      moveToIndex();
    }, 3000);

    track.addEventListener('transitionend', () => {
      if(index === 0){
        track.style.transition = 'none';
        index = cards.length;
        track.style.transform = `translateX(-${cardWidth * index}px)`;
      } else if(index === cards.length + 1){
        track.style.transition = 'none';
        index = 1;
        track.style.transform = `translateX(-${cardWidth * index}px)`;
      }
    });

    window.addEventListener('resize', () => {
      cardWidth = cards[0].getBoundingClientRect().width + 20;
      track.style.transition = 'none';
      track.style.transform = `translateX(-${cardWidth * index}px)`;
    });
  }

  // Initialize sliders
  initSlider('.slider-container .slider-track');  // Upcoming Hiring
  initSlider('.carousel-container .carousel-track'); // Active Hiring
  initSlider('.remote-jobs-slider .slider-track');