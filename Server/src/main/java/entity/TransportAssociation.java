/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package entity;

import java.sql.Timestamp;
import javax.validation.constraints.NotNull;

/**
 *
 * @author ksinn
 */
public abstract class TransportAssociation {
    private int id;
    @NotNull
    private Timestamp time;
    @NotNull
    private int isActive;
    
    public  int getId(){ return this.id; }
    public  Timestamp getTime(){ return this.time; }
    public  int getIsActive(){ return this.isActive; }
    public void setId( int id){ this.id = id; }
    public void setTime( Timestamp time){ this.time = time; }
    public void setIsActive( int isActive){ this.isActive = isActive; }
}
