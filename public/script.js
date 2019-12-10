var app = new Vue({
  el: '#app',
  data: {
    showForm: false,
    showAddForm: false,
    showEditForm: false,
    showDeleteForm: false,
    user: null,
    username: '',
    password: '',
    error: '',
    addedName: '',
    addedDescription: '',
    addedGoalType: '',
    addedProgress: '',
    addedGoal: '',
    tickets: [],
    goal_types: ["pages", "words", "hours"],
    editProject: null,
  },
  created() {
    this.getUser();
  },
  methods: {
    toggleAddForm() {
      this.addedName = "";
      this.addedDescription = "";
      this.addedGoalType = "";
      this.addedProgress = "";
      this.addedGoal = "";
      this.error = "";
      this.showAddForm = !this.showAddForm;
    },
    openEditForm(ticket) {
      console.log(ticket);
      this.editProject = ticket;
      this.addedName = ticket.name;
      this.addedDescription = ticket.description;
      this.addedGoalType = ticket.goal_type;
      this.addedProgress = ticket.progress;
      this.addedGoal = ticket.goal;
      this.showEditForm = true;
    },
    closeEditForm() {
      this.editProject = null;
      this.addedName = "";
      this.addedDescription = "";
      this.addedGoalType = "";
      this.addedProgress = "";
      this.addedGoal = "";
      this.error = "";
      this.showEditForm = false;
    },
    closeForm() {
      this.showForm = false;
    },
    toggleForm() {
      this.error = "";
      this.username = "";
      this.password = "";
      this.showForm = !this.showForm;
    },
    openDeleteForm(ticket) {
      this.editProject = ticket;
      this.showDeleteForm = true;
    },
    closeDeleteForm() {
      this.editProject = "";
      this.showDeleteForm = false;
    },
    calculatePercentage(ticket) {
      return (ticket.progress / ticket.goal) * 100;
    },
    async register() {
      this.error = "";
      try {
        let response = await axios.post("/api/users", {
          username: this.username,
          password: this.password
        });
        this.user = response.data;
        // close the dialog
        this.toggleForm();
      }
      catch (error) {
        this.error = error.response.data.message;
      }
    },
    async login() {
      this.error = "";
      try {
        let response = await axios.post("/api/users/login", {
          username: this.username,
          password: this.password
        });
        this.user = response.data;
        // close the dialog
        this.toggleForm();
        this.getTickets();
      }
      catch (error) {
        this.error = error.response.data.message;
      }
    },
    async logout() {
      try {
        let response = await axios.delete("/api/users");
        this.user = null;
        this.getUser();
      }
      catch (error) {
        // don't worry about it
      }
    },
    async getUser() {
      try {
        let response = await axios.get("/api/users");
        this.user = response.data;
        this.getTickets();
      }
      catch (error) {
        // Not logged in. That's OK!
        this.getTickets();
      }
    },
    async getTickets() {
      console.log("in getTickets");
      this.tickets = [];
      try {
        if (this.user !== null) {
          for (let project of this.user.projects) {
            console.log(project);
            let response = await axios.get("/api/users/userProject/" + project);
            if (response.data !== "") {
              this.tickets.push(response.data)
            }
          }

        }
        else {
          console.log("user is null");
        }
      }
      catch (error) {
        console.log(error);
      }
    },

    async addTicket() {
      this.error = "";
      try {
        if (this.addedName == "") {
          this.error = "Please add a name for your project";
          return;
        }
        if (this.addedGoalType == "") {
          this.error = "Please choose a goal type";
          return;
        }
        if (this.addedGoal == "") {
          this.addedGoal = 0;
        }
        if (this.addedProgress == "") {
          this.addedProgress = 0;
        }
        let response = await axios.post("/api/users/userProject", {
          name: this.addedName,
          description: this.addedDescription,
          goal_type: this.addedGoalType,
          progress: this.addedProgress,
          goal: this.addedGoal
        });
        this.addedName = "";
        this.addedDescription = "";
        await this.getUser();
        this.toggleAddForm();
      }
      catch (error) {
        this.error = error.response.data.message;
      }
    },
    async editTicket() {
      this.error = "";
      try {
        let ticket = this.editProject;
        //console.log(ticket._id);
        //setting defaults
        if (this.addedName == "") {
          this.error = "Please add a name for your project";
          return;
        }
        if (this.addedGoalType == "") {
          this.error = "Please choose a goal type";
          return;
        }
        if (this.addedGoal == "") {
          this.addedGoal = 0;
        }
        if (this.addedProgress == "") {
          this.addedProgress = 0;
        }
        let response = await axios.put("/api/users/userProject/" + ticket._id, {
          name: this.addedName,
          description: this.addedDescription,
          goal_type: this.addedGoalType,
          progress: this.addedProgress,
          goal: this.addedGoal
        })
        this.addedName = "";
        this.addedDescription = "";
        await this.getUser();
        this.closeEditForm();
      }
      catch (error) {
        console.log(error);
        this.error = error.response.data.message;

      }
    },
    async deleteTicket(ticket) {
      try {
        let ticket = this.editProject;
        let response = await axios.delete("/api/users/userProject/" + ticket._id);
        await this.getUser();
        this.closeDeleteForm();
      }
      catch (error) {
        console.log(error);
      }
    }
  }
});
