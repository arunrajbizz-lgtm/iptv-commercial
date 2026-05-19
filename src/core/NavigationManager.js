class NavigationManager {

  constructor() {

    this.stack = [];
  }

  // PUSH
  push(route) {

    this.stack.push(route);

    console.log(
      "NAV PUSH:",
      route
    );
  }

  // BACK
  back() {

    // REMOVE CURRENT
    this.stack.pop();

    // LAST
    const previous =

      this.stack[
        this.stack.length - 1
      ];

    return (
      previous
      || "/dashboard"
    );
  }

  // RESET
  reset() {

    this.stack = [];
  }

  // CURRENT
  current() {

    return (

      this.stack[
        this.stack.length - 1
      ]
      || "/dashboard"
    );
  }
}

const navigationManager =
  new NavigationManager();

export default navigationManager;