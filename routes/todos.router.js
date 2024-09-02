import express from "express";
import Todo from "../schemas/todo.schema.js";
import joi from "joi";

const router = express.Router();
/*
👉 **할 일 생성 API 유효성 검사 요구사항**

1. `value` 데이터는 **필수적으로 존재**해야한다.
2. `value` 데이터는 **문자열 타입**이어야한다.
3. `value` 데이터는 **최소 1글자 이상**이어야한다.
4. `value` 데이터는 **최대 50글자 이하**여야한다.
5. 유효성 검사에 실패했을 때, 에러가 발생해야한다.
*/
const createdTodoSchema = joi.object({
  value: joi.string().min(1).max(50).required(),
});

//할일 등록 API
router.post("/todos", async (req, res, next) => {
  // 1.클라이언트로 부터 받아온 value 데이터를 가져온다.

  try {
    // const { value } = req.body;

    const validation = await createdTodoSchema.validateAsync(req.body);
    const { value } = validation;
    //1-2.만약 클라이언트가 value 데이터를 전달하지 안았을 때 클라이언트에게 에러메세지를 전달한다.
    if (!value) {
      return res.status(400).json({
        errorMessage: "해야할 일(value)의 데이터가 존재하지 않습니다. ",
      });
    }

    //2.해당하는 마지막 order 데이터를 조회한다.
    const todoMaxOrder = await Todo.findOne().sort("-order").exec(); // exec:await사용시 함수를 promise로 작동하게해줌
    //3.만약 존재한다면 현재 해야 할 일을 +1 하고 , order 데이터가 존재하지않는다면 1로 할당한다.
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;
    //4.해야할 일 등록
    const todo = new Todo({ value, order });
    await todo.save(); //데이터 베이스에 저장한다.
    //5. 해야할 일을 클라이언트에 반환한다.
    return res.status(201).json({ todo: todo });
  } catch (error) {
    //Router 다음에 있는 에러 처리 미들웨어를 실행한다.
    next(error);
  }
});

//해야할 일 조회
router.get("/todos", async (req, res, next) => {
  //1.해야할 일 목록 조회
  const todos = await Todo.find().sort("-order").exec();
  //2.해야할 일 목록 조회결과를 클라이언트에 반환
  return res.status(200).json({ todos });
});

//할일 순서 변경 ,완료,내용 변경 /해재 API
router.patch("/todos/:todoId", async (req, res, next) => {
  const { todoId } = req.params;
  const { order, done, value } = req.body;
  //현재 나의 order가 무엇인지 알아야함
  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res.status(404).json({ errorMessage: "없는 할 일(order) 입니다" });
  }
  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }
    currentTodo.order = order;
  }
  if (done !== undefined) {
    currentTodo.doneAt = done ? new Date() : null;
  }
  if (value) {
    currentTodo.value = value;
  }
  await currentTodo.save();

  return res.status(200).json({});
});
//할일 삭제 API
router.delete("/todos/:todoId", async (req, res, next) => {
  const { todoId } = req.params;
  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res.status(404).json({ errorMessage: "존재하지 않는 정보입니다." });
  }
  await Todo.deleteOne({ _id: todoId });
  return res.status(200).json({});
});

export default router;
