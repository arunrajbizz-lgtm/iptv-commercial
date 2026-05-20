class PerformanceManager {

  constructor() {

    this.fps = 60;

    this.lastFrame =
      performance.now();

    this.frameCount = 0;

    this.memory = null;
  }

  // INIT
  initialize() {

    console.log(
      "Performance Manager Ready"
    );

    this.monitorFPS();

    this.monitorMemory();

    this.optimizeImages();

    this.optimizeAnimations();
  }

  // FPS
  monitorFPS() {

    const loop = () => {

      const now =
        performance.now();

      this.frameCount++;

      // UPDATE FPS
      if (
        now >
        this.lastFrame + 2000
      ) {

        this.fps =
          Math.round(

            (
              this.frameCount
              * 1000
            )
            /
            (
              now
              - this.lastFrame
            )
          );

        this.frameCount = 0;

        this.lastFrame = now;

        // Only log if low or every 10 seconds
        if (this.fps < 30 || Math.random() < 0.1) {
           console.log("FPS:", this.fps);
        }

        // LOW FPS
        if (
          this.fps < 20
        ) {

          this.enableLowPerformanceMode();
        }
      }

      requestAnimationFrame(
        loop
      );
    };

    requestAnimationFrame(
      loop
    );
  }

  // MEMORY
  monitorMemory() {

    try {

      if (
        performance.memory
      ) {

        setInterval(() => {

          this.memory = {

            used:
              Math.round(

                performance.memory
                  .usedJSHeapSize
                / 1048576
              ),

            total:
              Math.round(

                performance.memory
                  .totalJSHeapSize
                / 1048576
              )
          };

          console.log(
            "Memory:",
            this.memory
          );

        }, 30000);
      }

    } catch (error) {

      console.log(error);
    }
  }

  // LOW PERFORMANCE
  enableLowPerformanceMode() {

    console.log(
      "Low Performance Mode"
    );

    document.body.classList.add(
      "low-performance"
    );
  }

  // IMAGE OPTIMIZE
  optimizeImages() {

    const images =

      document.querySelectorAll(
        "img"
      );

    images.forEach(img => {

      img.loading =
        "lazy";

      img.decoding =
        "async";
    });
  }

  // ANIMATION
  optimizeAnimations() {

    document.documentElement.style.setProperty(

      "--gpu-transform",

      "translateZ(0)"
    );
  }

  // CLEANUP
  cleanup() {

    console.log(
      "Performance Cleanup"
    );
  }

  // GET FPS
  getFPS() {

    return this.fps;
  }

  // GET MEMORY
  getMemory() {

    return this.memory;
  }
}

const performanceManager =
  new PerformanceManager();

export default performanceManager;