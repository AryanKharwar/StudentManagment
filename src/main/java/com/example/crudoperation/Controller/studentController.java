package com.example.crudoperation.Controller;

import com.example.crudoperation.modal.student;
import com.example.crudoperation.repository.studentrepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class studentController {

    @Autowired
    studentrepo obj;

    @GetMapping("/getst")
    @ResponseBody
    public List<student> getAll(){
        return obj.findAll();
    }

    @PostMapping("/create")
    public String creatStudent(@RequestParam int id, @RequestParam String name, @RequestParam String email,
                               @RequestParam String course, @RequestParam int semester, @RequestParam String phone){

        
        if(!obj.existsById(id)){
            student st = new student();
            st.setId(id);
            st.setName(name);
            st.setEmail(email);
            st.setCourse(course);
            st.setSemester(semester);
            st.setPhone(phone);
    
            obj.save(st);
            return "redirect:/success.html";
        }

        return "redirect:/alreadyUsed.html";
    }

    @GetMapping("/searchstudent")
    @ResponseBody
    public student searchStudent(@RequestParam int id) {

        return obj.findById(id).orElse(null);
    }

    // Delete is now POST (not GET) so a simple link or image on another site cannot delete students.
    @PostMapping("/deletestudent")
    public String deleteStudent(@RequestParam int id){

        if(obj.existsById(id)){
            obj.deleteById(id);
            return "redirect:/deleteSuccess.html";
        }
        return "redirect:/StudentNotfound.html";
    }

    @GetMapping("/update")
    public String updateStudent(@RequestParam int id){
        if(obj.existsById(id)){
            return "redirect:/updateStudent2.html";
        }else{
        return "redirect:/StudentNotfound.html";
        }
    }

    @PostMapping("/updateSt")
    public String updateSt(@RequestParam int id,@RequestParam String name,
                           @RequestParam String email,@RequestParam String course,
                            @RequestParam int semester,@RequestParam String phone){

        student st = new student();
        st.setId(id);
        st.setName(name);
        st.setEmail(email);
        st.setCourse(course);
        st.setSemester(semester);
        st.setPhone(phone);

        obj.save(st);
        return "redirect:/success.html";
    }
}
