/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package entity;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import org.apache.log4j.Logger;

/**
 *
 * @author ksinn
 */
public class RouteType {
    
    private int id;
    @NotNull
    @Size(min=1, max=255, message="Name must be between 1 and 255 characters long.")
    @Pattern(regexp="^[a-zA-Z0-9 ]+$", message="Name must consist from alphabet, numiracle and space characters only.")
    private String name;
    @NotNull
    private int payment_amount;
    
    private static final Logger log = Logger.getLogger(RouteType.class.getName());
    
    public int getId(){return id;}
    public String getName(){return name;}
    public int getPaymentAmount(){return payment_amount;}
    public void setId(int id){this.id = id;}
    public void setName(String name){this.name = name;}
    public void setPaymentAmount(int payment_amount){this.payment_amount = payment_amount;}
    
}
