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
public class Transport {
    
    private int id;
    @NotNull
    @Size(min=10, max=10, message="Name must be 10 characters long.")
    @Pattern(regexp="^[A-Z0-9]+$", message="Name must consist from alphabet in upper case and number characters only.")
    private String govNumber;
    @NotNull
    private Route route;
    @NotNull
    private TransportType type;
    @NotNull
    private Driver driver;
    
    private static final Logger log = Logger.getLogger(Transport.class.getName());
    
    public  int getId(){ return this.id; }
    public  String getGovNumber(){ return this.govNumber; }
    public  Route getRoute(){ return this.route; }
    public  TransportType getType(){ return this.type; }
    public  Driver getDriver(){ return this.driver; }
    public void setId( int id){ this.id = id; }
    public void setGovNumber( String govNumber){ this.govNumber = govNumber; }
    public void setRoute( Route route){ this.route = route; }
    public void setType( TransportType type){ this.type = type; }
    public void setDriver( Driver driver){ this.driver = driver; }
    
}
