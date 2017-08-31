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
public class RouteAssociation extends TransportAssociation{
    
    
    @NotNull
    private Route route;
    
    public  Route getRoute(){ return this.route; }
    public void setRoute( Route route){ this.route = route; }
    
}
