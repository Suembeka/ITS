/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package entity;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import org.apache.log4j.Logger;

/**
 *
 * @author ksinn
 */
public class Station implements Serializable{
    private int id;
    @NotNull
    @Size(min=1, max=255, message="Name must be between 1 and 255 characters long.")
    @Pattern(regexp="^[a-zA-Z0-9 ]+$", message="Name must consist from alphabet, numiracle and space characters only.")
    private String name;
    @NotNull
    private int type;
    @NotNull
    @Size(min=1, max=50, message="Name must be between 1 and 50 characters long.")
    private String latlng;
    private Set<StationAssociation> associations;
    
    private static final Logger log = Logger.getLogger(Station.class.getName());
    
    {
        associations = new HashSet<>();
    }
    
    public int getId(){return id;}
    public String getName(){return name;}
    public int getType(){return type;}
    public String getLatlng(){return latlng;}
    public Set<StationAssociation> getAssociations(){ return associations; }
    public void setId(int id){this.id = id;}
    public void setName(String name){this.name = name;}
    public void setType(int type){this.type = type;}
    public void setLatlng(String latlng){this.latlng = latlng;} 
    public void setAssociations(Set<StationAssociation>  associations){ this.associations = associations; }
    
    public void addAssociations(StationAssociation association){ associations.add(association); }
    

}
