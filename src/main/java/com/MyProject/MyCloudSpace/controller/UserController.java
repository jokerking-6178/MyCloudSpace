package com.MyProject.MyCloudSpace.controller;

import com.MyProject.MyCloudSpace.Entity.Role;
import com.MyProject.MyCloudSpace.io.UserRequest;
import com.MyProject.MyCloudSpace.io.UserResponse;
import com.MyProject.MyCloudSpace.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;


@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse registerUser(@RequestBody UserRequest request){
        try{
            return userService.createUser(request);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to create user" +e.getMessage());
        }
    }


    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable String id){
        try{
            userService.deleteUser(id);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public UserResponse findUser(@PathVariable String id){
        UserResponse user =  userService.findById(id);
        return user;
    }

    @GetMapping("/email/{email}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public UserResponse findUserByEmail(@PathVariable String email){
        UserResponse user =  userService.findByEmail(email);
        return user;
    }

    @GetMapping("/role/{id}")
    @ResponseStatus(HttpStatus.OK)
    public UserResponse updateUserRole(@PathVariable String id, @RequestBody Role role){
        UserResponse updatedUser = userService.upgradeUser(id, role);
        return updatedUser;
    }

    @GetMapping("/disable/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public String disableUser(@PathVariable String id){
        String msg = userService.disableUser(id);
        return msg;
    }
}
