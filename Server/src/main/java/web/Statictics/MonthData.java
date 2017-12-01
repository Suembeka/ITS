/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package web.Statictics;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;
import statictics.StaticticsService;

/**
 *
 * @author ksinn
 */
@WebServlet(name = "MonthData", urlPatterns = {"/month"})
public class MonthData extends HttpServlet {



    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        JSONObject res =  new JSONObject();
        try {         
            String[] p = request.getParameterValues("data[]");
            JSONArray data = StaticticsService.getRoute().getMonthinYear(p);
            res.put("status", "ok");
            res.put("error", "");
            res.put("data", data);
        } catch (Exception ex) {
            res.put("status", "error");
            res.put("error", ex.getMessage());
        }
        response.getWriter().print(res.toString());
        
    }


    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
