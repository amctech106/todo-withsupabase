const inp = document.querySelector("#add-todo");
const btn = document.querySelector("button");
const result = document.querySelector("#result");

const supabaseConnect = supabase.createClient(
    "https://gapkxjiupqjinncgjonc.supabase.co",
    "sb_publishable_ZLGVvTKhtdx_VvbjSPGZfw_64HfEpFF"
);

//ڈیٹا لے کر ٹیبل میں ڈالنے کا فنکشن 

const getData = async () => {
    result.innerHTML = "";
    const response = await supabaseConnect.from("todos").select("*").order("id", { ascending: true });
    const todos = response.data;

    if (!todos) return;

    todos.forEach((todo, index) => {
        result.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${todo.task}</td>
                <td>
                    <button onclick="editTodo(${todo.id}, '${todo.task}')">Edit</button>
                </td>
                <td>
                    <button onclick="deleteTodo(${todo.id})">Delete</button>
                </td>
            </tr>`;
    });
};

getData();

//ایڈ ٹوڈو 
btn.addEventListener("click", async () => {
    const task = inp.value.trim();

    if (!task) {
        Swal.fire({
            icon: "warning",
            title: "خالی ٹاسک!",
            text: "براہ کرم پہلے کچھ لکھیں۔",
            confirmButtonColor: "#2563eb"
        });
        return;
    }

    const { error } = await supabaseConnect.from("todos").insert([{ task: task }]);

    if (error) {
        Swal.fire({
            icon: "error",
            title: "ایرر!",
            text: error.message
        });
        return;
    }

    inp.value = "";
    getData();
    
    Swal.fire({
        icon: "success",
        title: "ٹاسک شامل ہو گیا!",
        timer: 1000,
        showConfirmButton: false
    });
});

//ڈلیٹ 
window.deleteTodo = async (id) => {
    const confirmResult = await Swal.fire({
        title: "کیا آپ کو یقین ہے؟",
        text: "یہ ٹاسک مستقل طور پر ڈیلیٹ ہو جائے گا!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        confirmButtonText: "ہاں، ڈیلیٹ کریں!",
        cancelButtonText: "کینسل"
    });

    if (!confirmResult.isConfirmed) return;

    const { error } = await supabaseConnect.from("todos").delete().eq("id", id);
    if (!error) {
        getData();
        Swal.fire({
            icon: "success",
            title: "ڈیلیٹ ہو گیا!",
            timer: 1200,
            showConfirmButton: false
        });
    }
};

// ایڈٹ 
window.editTodo = async (id, currentTask) => {
    const { value: updatedTask } = await Swal.fire({
        title: "ٹاسک اپ ڈیٹ کریں",
        input: "text",
        inputValue: currentTask,
        showCancelButton: true,
        confirmButtonColor: "#0284c7",
        cancelButtonColor: "#64748b",
        confirmButtonText: "اپ ڈیٹ کریں",
        cancelButtonText: "کینسل",
        inputValidator: (value) => {
            if (!value.trim()) {
                return "ٹاسک خالی نہیں چھوڑا جا سکتا!";
            }
        }
    });

    if (updatedTask) {
        const { error } = await supabaseConnect
            .from("todos")
            .update({ task: updatedTask.trim() })
            .eq("id", id);

        if (!error) {
            getData();
            Swal.fire({
                icon: "success",
                title: "اپ ڈیٹ ہو گیا!",
                timer: 1200,
                showConfirmButton: false
            });
        }
    }
};