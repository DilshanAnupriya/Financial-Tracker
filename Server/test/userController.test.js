const { signUp , logIn} = require('../controller/userController');
const User = require('../model/userModel');




jest.mock('../model/userModel');

const req = {
    body:{
        username:"luffy",
        password:"1234",
        email:"luffy@example.com",
        role:"User",
    },
};

const res = {
    status: jest.fn(() => ({
        json: jest.fn(),
    })),
};

it('should send a status code of 404 when user exists', async () => {
    User.findOne.mockImplementationOnce(()=>({
        id:1,
        username:"zoro",
        password:"12",
        email:"zoro@example.com",
        role:"User",

    }));
    await signUp(req,res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.status).toHaveBeenCalledTimes(1);

});

it('should send a status code of 201 when user is created', async () => {
    User.findOne.mockResolvedValueOnce(undefined);
    User.create.mockResolvedValueOnce({
        id:1,
        username:"zoro",
        password:"1234",
        email:"zoro@example.com",
        role:"User",
    });

    await  signUp(req,res);
    expect(res.status).toHaveBeenCalledWith(201);

})

