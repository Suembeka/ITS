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
public class DriverAssociation extends TransportAssociation{
    
    @NotNull
    private Driver driver;
    
    public  Driver getDriver(){ return this.driver; }
    public void setDriver( Driver driver){ this.driver = driver; }
    
}
