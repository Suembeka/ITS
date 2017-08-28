/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package entity;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

/**
 *
 * @author ksinn
 */
public class Driver {
    
    private int id;
    
    @NotNull
    @Size(min=4, max=255, message="Name must be between 4 and 255 characters long.")
    @Pattern(regexp="^[a-zA-Z ]+$", message="Name must consist from alphabet and space characters only.")
    private String name;
    
    public int getId(){ return id; }
    public String getName(){ return name; }
    public void setId(int id){ this.id = id; }
    public void setName(String name){ this.name = name; }
    
}
